
const Alexa = require('ask-sdk-core');
const i18n = require('i18next');
const sprintf = require('i18next-sprintf-postprocessor');
const request = require('request-promise');

var counter = 0 ;




const languageString = {
  en: {
    translation: {
      HELP_MESSAGE: ' I can provide G.G.S.I.P.U. results.',
      REPEAT_QUESTION_MESSAGE: '  ',
      ASK_MESSAGE_START: ' ',
      ASK_CONTINUE: ' ',
      STOP_MESSAGE: ' ',
      CANCEL_MESSAGE: '  ',
      NO_MESSAGE: '  ',
      FACT_UNHANDLED: ' ',
      HELP_UNHANDLED: ' ',
      START_UNHANDLED: '  ',
      WELCOME_MESSAGE: '  ',
      New_IDEA: ' ',
      USER_NAME: 'Hello, %s , ',
      OUT: ' you got %s % in semester %s, ',
      REPEAT_OUT: '%s % in semester %s, ',
      TOTAL: 'and your overall percentage is %s %.',

    },
  },
 
  
};

//____________________________________________________ LocalizationInterceptor______________________________________________


const LocalizationInterceptor = {
  process(handlerInput) {
    const localizationClient = i18n.use(sprintf).init({
      lng: handlerInput.requestEnvelope.request.locale,
      overloadTranslationOptionHandler: sprintf.overloadTranslationOptionHandler,
      resources: languageString,
      returnObjects: true
    });

    const attributes = handlerInput.attributesManager.getRequestAttributes();
    attributes.t = function (...args) {
      return localizationClient.t(...args);
    };
  },
};

//____________________________________________________ Launch Intent handler______________________________________________

const LaunchRequest = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;

    return request.type === 'LaunchRequest'
      || (request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.StartOverIntent');
  },
  handle(handlerInput) {
    
  return handlerInput.responseBuilder
      .speak("Welcome to Guru Gobind Singh Indraprasth University Report Card Skill. Tell me your roll number please. ")
      .reprompt('Shall I start ?')
      .withSimpleCard('GGSIPU Report Card')
      .getResponse();
  },
};


async function run(theNumber,handlerInput) {

  const requestAttributes = handlerInput.attributesManager.getRequestAttributes();

    var options = {
        uri: 'https://outcome-ipu.herokuapp.com/find/' + String(theNumber),
        json: true // Automatically parses the JSON string in the response
    };

    let a = await request(options);
    console.log("a :: "+a);

    var lst = [];
            var total = 0;
            var count = 0;
            for(let i=0; i < a.length;i++)
            {
                var sum = 0;
                var temp = {};

                for(let j=0; j < a[i].Marks.length; j++){
                      sum += parseInt(a[i].Marks[j].Total,10);
                      count = count + 1;
                }

                total += sum;
                temp.semester = parseInt(a[i].Semester,10);
                temp.sem_per = Math.round((sum / a[i].Marks.length)*100)/100;
                lst.push(temp);
            }
            lst.sort(function(m,n){return m.semester - n.semester});
            console.log(lst);
            var perc = Math.round((total/count)*100)/100;
            
            var speechOut = requestAttributes.t('USER_NAME',a[0].Name);
            
            for(let i=0; i < lst.length ; i++){
              if(i==0)
              {
                speechOut += requestAttributes.t('OUT',lst.sem_per,lst.semester);
              }
              else{
                speechOut += requestAttributes.t('REPEAT_OUT',lst.sem_per,lst.semester);
              }
            }
            
            speechOut += requestAttributes.t('TOTAL',perc);
            
            return handlerInput.responseBuilder
                .speak(speechOut)
                .withSimpleCard('Overall Percentage is '+perc+'%')
                .getResponse();



} 

//________________________________________________Type Intent_________________________________________________
const TypeIntent = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
        && handlerInput.requestEnvelope.request.intent.name === 'type';
  },
  handle(handlerInput) {
    
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    
    const val = handlerInput.requestEnvelope.request.intent.slots.typeslot.value;
    
    if (val=='overall'||val=='complete'){

      const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
      
      var a ;
      if(sessionAttributes.rollNumber){
          const theNumber = sessionAttributes.rollNumber;

          // const url = `https://outcome-ipu.herokuapp.com/find/${theNumber}`;
          run(theNumber,handlerInput);
        
        
               
               if(a.length > 0 ){ 
    
            
          }
          else{
            
            return handlerInput.responseBuilder
                .speak('You have given a invalid roll number. Please tell me your roll number again.')
                .reprompt('Give Roll Number Again.')
                .withSimpleCard('Invalid Roll Number')
                .getResponse();
            
          }

    
      

      }
      else{

      return handlerInput.responseBuilder
       .speak("Unsuccessful ")
       .getResponse();

      }
      
      
    }
    
    else if (val=='college'||val=='rank'){
      
      
    }
    else if (val=='sem'||val=='semester'){
      
    }
    
    else{
      
    }
    
   
  },
}
//________________________________________________Roll Intent_________________________________________________


const RollIntent = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
        && handlerInput.requestEnvelope.request.intent.name === 'roll';
  },
  handle(handlerInput) {
    
    const sessionAttributes = {};
    const rollStock = handlerInput.requestEnvelope.request.intent.slots.hello.value;
    
    Object.assign(sessionAttributes, {
    rollNumber: rollStock,
  });
  
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
  
    console.log('VALUE ::'+ rollStock);
    
    return handlerInput.responseBuilder
      .speak("What would you like to have? 1. Semester results, 2. Overall Results, 3. College Ranks")
      .reprompt('Shall I start ?')
      .withSimpleCard('Report Card')
      .getResponse();
      

   
  },
};

//________________________________________________________Help Intent__________________________________________________


const HelpIntent = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;

    return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    
    return handlerInput.responseBuilder
      .speak(requestAttributes.t('HELP_MESSAGE')+requestAttributes.t('REPEAT_QUESTION_MESSAGE')+requestAttributes.t('ASK_CONTINUE'))
      .reprompt('Shall I start ?')
      .getResponse();

  },
};



//________________________________________________________Unhandled_Intent__________________________________________________


const UnhandledIntent = {
  canHandle() {
    return true;
  },
  handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    if (Object.keys(sessionAttributes).length === 0) {
      const speechOutput = requestAttributes.t('START_UNHANDLED');
      return handlerInput.attributesManager
        .speak(speechOutput)
        .reprompt(speechOutput)
        .getResponse();
    } else if (sessionAttributes.question) {
      const speechOutput = requestAttributes.t('FACT_UNHANDLED');
      return handlerInput.attributesManager
        .speak(speechOutput)
        .reprompt(speechOutput)
        .getResponse();
    }
    const speechOutput = requestAttributes.t('HELP_UNHANDLED');
    return handlerInput.attributesManager.speak(speechOutput).reprompt(speechOutput).getResponse();
  },
};


//________________________________________________Session_ended_Request_________________________________________________

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    console.log("Inside SessionEndedRequestHandler");
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${JSON.stringify(handlerInput.requestEnvelope)}`);
    return handlerInput.responseBuilder.getResponse();
  },
};

//________________________________________________Repeat Intent_________________________________________________


const RepeatIntent = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
        && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.RepeatIntent';
  },
  handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    if(counter==0){
      
      return handlerInput.responseBuilder
      .speak(requestAttributes.t('HELP_MESSAGE')+requestAttributes.t('REPEAT_QUESTION_MESSAGE')+requestAttributes.t('ASK_CONTINUE'))
      .reprompt('Shall I start ?')
      .getResponse();
    
    }
    else{
      return handlerInput.responseBuilder.speak(sessionAttributes.question+' Would you like to know more ?')
      .reprompt(sessionAttributes.question+' Would you like to know more ?')
      .getResponse();
    }
    
  },
};

//________________________________________________YES Intent_________________________________________________





const StopIntent = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
        && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    const speechOutput = requestAttributes.t('STOP_MESSAGE');

    return handlerInput.responseBuilder
      .speak(speechOutput)
      .withShouldEndSession(true)
      .getResponse();
  },
};

const CancelIntent = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    const speechOutput = requestAttributes.t('CANCEL_MESSAGE');

    return handlerInput.responseBuilder
      .speak(speechOutput)
      .withShouldEndSession(true)
      .getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.custom();
exports.handler = skillBuilder
  .addRequestHandlers(
    
    LaunchRequest,
    RollIntent,
    TypeIntent,
    
    
    HelpIntent,
    RepeatIntent,
    
   
    StopIntent,
    CancelIntent,
  
    
    SessionEndedRequestHandler,
    UnhandledIntent
  )
  .addRequestInterceptors(LocalizationInterceptor)
  .addErrorHandlers(ErrorHandler)
  .lambda();