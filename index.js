/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/
/**
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills
 * nodejs skill development kit.
 * This sample supports multiple lauguages. (en-US, en-GB, de-DE).
 * The Intent Schema, Custom Slots and Sample Utterances for this skill, as well
 * as testing instructions are located at https://github.com/alexa/skill-sample-nodejs-fact
 **/

'use strict';

const Alexa = require('alexa-sdk');
const moment = require('moment');


const APP_ID = undefined;  // TODO replace with your app ID (OPTIONAL).

const languageStrings = {
    'de-DE': {
        translation: {
            SKILL_NAME: 'Wacken Countdown',
            GET_DAYS_MESSAGE1: 'Wacken ',
            GET_DAYS_MESSAGE2: ' beginnt am ',
            GET_DAYS_MESSAGE3: ' Das sind noch ',
            GET_DAYS_MESSAGE4: ' Tage.',
	    WOA_IN_PROGRESS: 'Wacken läuft gerade.',
            HELP_MESSAGE: 'Frag mich einfach in wie vielen Tagen Wacken ist.',
            STOP_MESSAGE: 'See you in Wacken. Rain or shine!',
        },
    },
};

const handlers = {
    'LaunchRequest': function () {
        this.emit('GetDaysLeft');
    },
    'GetDaysLeft': function () {
        function calcWackenStart(year)
        {
                var wackenYear = year || moment().year();
                var tmpDate = moment(wackenYear + "-08-01");
 
                // wir suchen den ersten Samstag im August, das sollte unser Endtermin sein
                while (tmpDate.day() != 6)
                {
                               tmpDate.add(1,'d');
                }
 
                return {
                               start: tmpDate.clone().add(-2, 'd'),
                               ende: tmpDate
                };
        }
        // Use this.t() to get corresponding language data
	// Wackenzeitraum für aktuelles Jahr berechnen (start , ende)
	var woaDate = calcWackenStart();
 
	// akuelles Datum berechnen
	const now = moment().startOf('day');
 
	// schauen ob Wacken gerade läuft
	const wackenIsNow = now.isSameOrAfter(woaDate.start) && now.isSameOrBefore(woaDate.ende);
 
	// schauen ob Wacken dieses Jahr schon vorbei ist
	var wackenIsOver = now.isAfter(woaDate.ende);
 
	// wenn ja, dann Wacken für nächstes Jahr berechnen
	if (wackenIsOver)
	{
		var nextYear = now.year() + 1;
		woaDate = calcWackenStart(nextYear);
	}

	var speechOutput = "";

	// wenn wacken nicht läuft, dann Tage berechnen
	if (wackenIsNow)
	{
		speechOutput = this.t('WOA_IN_PROGRESS');
	} else {
		speechOutput = this.t('GET_DAYS_MESSAGE1') + woaDate.start.format('YYYY') + this.t('GET_DAYS_MESSAGE2') + woaDate.start.format('DD.MM.') + this.t('GET_DAYS_MESSAGE3') + woaDate.start.diff(now,'days') + this.t('GET_DAYS_MESSAGE4');
	}

        this.emit(':tellWithCard', speechOutput, this.t('SKILL_NAME'));
    },
    'AMAZON.HelpIntent': function () {
        const speechOutput = this.t('HELP_MESSAGE');
        const reprompt = this.t('HELP_MESSAGE');
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
    'SessionEndedRequest': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
};

exports.handler = (event, context) => {
    const alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

