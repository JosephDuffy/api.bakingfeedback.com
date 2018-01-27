import { ArrayMinSize, IsBoolean, IsEmail, IsOptional, MinLength } from 'class-validator';

namespace SurveyResult {
  export class Body {

    @ArrayMinSize(2)
    public readonly answers: Array<{ [inputId: string]: any }>;

    @MinLength(2)
    public readonly name: string;

    @IsBoolean()
    @IsOptional()
    public readonly showName?: boolean;

    @IsEmail()
    public readonly email: string;

  }

  export class Full extends Body {
    public readonly id: string;

    public readonly surveyId: string;

    public readonly showName: boolean;
  }
}

export default SurveyResult;
