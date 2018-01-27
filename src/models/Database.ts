import Loki = require('lokijs');
import { Service } from 'typedi';
import * as uuid from 'uuid/v4';

import Survey from '../interfaces/Survey';
import SurveyResult from '../interfaces/SurveyResult';

@Service()
export default class Database {

  /// The Loki instance backing the database
  private loki: Loki;

  private surveys: LokiCollection<Survey>;
  private surveyResults: LokiCollection<SurveyResult.Full>;

  constructor(filename: string = './database.json') {
    this.loki = new Loki(filename, {
      autosave: true,
      serializationMethod: process.env.NODE_ENV === 'development' ? 'pretty' : 'normal',
    } as any);
  }

  public async initialise() {
    return new Promise((resolve, reject) => {
      this.loki.loadDatabase({}, (error) => {
        if (error) {
          reject(error);
          return;
        }

        this.surveys = this.loadOrCreateCollection('surveys');
        this.surveyResults = this.loadOrCreateCollection('surveyResults');

        resolve();
      });
    });
  }

  public surveyWithId(id: string): Survey & DatabaseProperties {
    return this.surveys.findOne({ id });
  }

  public latestSurvey(): Survey & DatabaseProperties {
    return this.surveys.chain()
                       .simplesort('meta.created', true)
                       .limit(1)
                       .data()[0];
  }

  public retrieveAllSurveys(): Survey[] {
    return this.surveys.find();
  }

  public addSurveyResult(surveyId: string, body: SurveyResult.Body): SurveyResult.Full {
    const fullResult: SurveyResult.Full = {
      ...body,
      showName: body.showName || false,
      surveyId,
      id: uuid(),
    };

    this.surveyResults.insertOne(fullResult);

    return fullResult;
  }

  public retrieveResultsToSurvey(surveyId: string): SurveyResult.Full[] {
    return this.surveyResults.find({
      survey: {
        id: surveyId,
      },
    }).data();
  }

  public retrieveResultToSurvey(surveyId: string, email: string): SurveyResult.Full | null {
    return this.surveyResults.findOne({
      surveyId,
      email,
    });
  }

  private loadOrCreateCollection<StoredType>(collectionName: string, options?: LokiCollectionOptions): LokiCollection<StoredType> {
    const loadedCollection = this.loki.getCollection<StoredType>(collectionName);

    if (loadedCollection !== null) {
      return loadedCollection;
    }

    return this.loki.addCollection(collectionName, options);
  }

}

export interface DatabaseProperties {
  readonly id: string;
}
