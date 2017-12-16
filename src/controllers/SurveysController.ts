import { Body, Get, HttpCode, HttpError, JsonController, OnNull, OnUndefined, Param, Post, Put } from 'routing-controllers';
import { Inject, Service } from 'typedi';
import * as winston from 'winston';

import Survey from '../interfaces/Survey';
import SurveyResult from '../interfaces/SurveyResult';
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

  @Post('/:surveyId/results')
  @HttpCode(201)
  public async saveSurveyResult(
    @Param('surveyId') surveyId: string,
    @Body() body: {
      readonly answers: Array<{ [inputId: string]: any }>;
      readonly name: string;
      readonly anonymous: boolean;
      readonly email: string;
    },
  ): Promise<SurveyResult & DatabaseProperties> {
    const existingResult = this.database.retrieveResultToSurvey(surveyId, body.email);

    if (!existingResult) {
      throw new HttpError(400, 'A result has already been submitted with this email address');
    }

    const result = {
      surveyId,
      ...body,
    };

    return this.database.addSurveyResult(result);
  }

}
