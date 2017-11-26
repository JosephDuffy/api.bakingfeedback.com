import Loki = require('lokijs');
import { Service } from 'typedi';

import Survey from '../interfaces/Survey';
import SurveyResult from '../interfaces/SurveyResult';

@Service()
export default class Database {

  /// The Loki instance backing the database
  private loki: Loki;

  private surveys: LokiCollection<Survey>;
  private surveyResults: LokiCollection<SurveyResult>;

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

  public retrieveAllSurveys(): Survey[] {
    return this.surveys.find();
  }

  public addSurveyResult(result: SurveyResult) {
    this.surveyResults.add(result);
  }

  public retrieveResultsToSurvey(surveyId: string): SurveyResult[] {
    return this.surveyResults.find({
      survey: {
        id: surveyId,
      },
    }).data();
  }

  private loadOrCreateCollection<StoredType>(collectionName: string, options?: LokiCollectionOptions): LokiCollection<StoredType> {
    const loadedCollection = this.loki.getCollection<StoredType>(collectionName);

    if (loadedCollection !== null) {
      return loadedCollection;
    }

    return this.loki.addCollection(collectionName, options);
  }

}
