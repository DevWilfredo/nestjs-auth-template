import { IsString } from "class-validator";

export class SendEmailDto {

    @IsString()
    to!: string;

    @IsString()
    subject!: string;

    @IsString()
    text?: string;

    @IsString()
    html?: string;

    @IsString()
    template?: string;

    templateVars?: Record<string, any>;
}