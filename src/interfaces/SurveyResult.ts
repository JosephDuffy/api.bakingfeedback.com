import { IsEmail } from 'class-validator';

namespace SurveyResult {
  export class Body {
    public readonly answers: Array<{ [inputId: string]: any }>;
    public readonly name: string;
    public readonly anonymous: boolean;
    @IsEmail()
    public readonly email: string;
  }

  export class Full extends Body {
    public readonly id: string;

    public readonly surveyId: string;
  }
}

export default SurveyResult;
