import { IsEmail } from 'class-validator';
import * as crypto from 'crypto-promise';
import { BadRequestError, Body, Get, HttpCode, JsonController, OnNull, OnUndefined, Param, Post, Put } from 'routing-controllers';
import { Inject, Service } from 'typedi';
import * as winston from 'winston';

import Survey from '../interfaces/Survey';
import SurveyResult from '../interfaces/SurveyResult';
import { BadRequestErrorWithCode } from '../models/BadRequestErrorWithCode';
import Database, { DatabaseProperties } from '../models/Database';

@JsonController('/surveys')
@Service()
export default class SurveysController {

  @Inject()
  private database: Database;

  @Get('/:surveyId')
  @OnNull(404)
  public getSurveyById(@Param('surveyId') surveyId: string): Survey & DatabaseProperties {
    if (surveyId === 'latest') {
      return this.database.latestSurvey();
    } else {
      return this.database.surveyWithId(surveyId);
    }
  }

  @Get('/:surveyId/results')
  @OnNull(404)
  public async getSurveyResults(
    @Param('surveyId') surveyId: string,
  ): Promise<SurveyResult.Public[]> {
    return this.database.retrieveResultsToSurvey(surveyId).map(fullResult => new SurveyResult.Public(fullResult));
  }

  @Post('/:surveyId/results')
  @HttpCode(201)
  public async saveSurveyResult(
    @Param('surveyId') surveyId: string,
    @Body() body: SurveyResult.Body,
  ): Promise<SurveyResult.Full> {
    const emailHash = await crypto.hash('md5')(body.email.toLowerCase());
    const emailHashString = emailHash.toString('hex');
    const existingResult = this.database.retrieveResultToSurvey(surveyId, emailHashString);

    if (existingResult) {
      throw new BadRequestErrorWithCode(1, 'A result has already been submitted with this email address');
    }

    const surveyResult = {
      ...body,
      email: emailHashString,
    };

    return this.database.addSurveyResult(surveyId, surveyResult);
  }

}
