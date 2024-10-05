import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const GOOGLE_CLIEND_ID = process.env.GOOGLE_CLIEND_ID  as string
const GOOGLE_CLIEND_ID_SECRET = process.env.GOOGLE_CLIEND_ID_SECRET as string

export const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIEND_ID,     
  GOOGLE_CLIEND_ID_SECRET, 
  "postmessage"  
);
