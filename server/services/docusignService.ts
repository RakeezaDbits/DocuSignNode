import docusign from 'docusign-esign';
import * as fs from 'fs';
import * as path from 'path';

interface AgreementRequest {
  recipientEmail: string;
  recipientName: string;
  appointmentId: string;
}

interface AgreementResult {
  envelopeId: string;
  status: string;
}

class DocusignService {
  private apiClient: docusign.ApiClient;
  private accountId: string;
  private integrationKey: string;
  private userId: string;
  private privateKey: string;
  private basePath: string;

  constructor() {
    this.accountId = process.env.DOCUSIGN_ACCOUNT_ID || '';
    this.integrationKey = process.env.DOCUSIGN_INTEGRATION_KEY || '';
    this.userId = process.env.DOCUSIGN_USER_ID || '';
    this.privateKey = process.env.DOCUSIGN_PRIVATE_KEY?.replace(/\\n/g, '\n') || '';
    this.basePath = process.env.NODE_ENV === 'production' 
      ? 'https://na3.docusign.net/restapi'
      : 'https://demo.docusign.net/restapi';

    this.apiClient = new docusign.ApiClient();
    this.apiClient.setBasePath(this.basePath);

    if (this.integrationKey && this.userId && this.privateKey) {
      this.configureJWTAuth().catch(error => {
        console.error('DocuSign authentication failed:', error.message);
        console.log('DocuSign features will be disabled');
      });
    } else {
      console.log('DocuSign credentials not configured, DocuSign features will be disabled');
    }
  }

  private async configureJWTAuth(): Promise<void> {
    try {
      const scopes = ['signature', 'impersonation'];

      const results = await this.apiClient.requestJWTUserToken(
        this.integrationKey,
        this.userId,
        scopes,
        this.privateKey,
        3600
      );

      if (results && results.body && results.body.access_token) {
        this.apiClient.addDefaultHeader('Authorization', `Bearer ${results.body.access_token}`);
        console.log('DocuSign JWT authentication successful');
      }
    } catch (error) {
      console.error('DocuSign JWT authentication error:', error);
      throw error;
    }
  }

  async sendAgreement(request: AgreementRequest): Promise<AgreementResult> {
    try {
      if (!this.integrationKey || !this.userId || !this.privateKey) {
        throw new Error('DocuSign credentials not configured');
      }

      const envelopesApi = new docusign.EnvelopesApi(this.apiClient);

      // Create the envelope definition
      const envelopeDefinition = new docusign.EnvelopeDefinition();
      envelopeDefinition.emailSubject = 'GuardPortal Asset Protection Agreement - Please Sign';
      envelopeDefinition.status = 'sent';

      // Create document
      const document1 = new docusign.Document();
      document1.documentBase64 = this.getAgreementDocumentBase64();
      document1.name = 'Asset Protection Agreement';
      document1.fileExtension = 'pdf';
      document1.documentId = '1';

      envelopeDefinition.documents = [document1];

      // Create recipient
      const signer1 = new docusign.Signer();
      signer1.email = request.recipientEmail;
      signer1.name = request.recipientName;
      signer1.recipientId = '1';
      signer1.routingOrder = '1';

      // Create signature tab
      const signHere1 = new docusign.SignHere();
      signHere1.documentId = '1';
      signHere1.pageNumber = '1';
      signHere1.recipientId = '1';
      signHere1.tabLabel = 'SignHereTab';
      signHere1.xPosition = '195';
      signHere1.yPosition = '147';

      const signHereTabs = [signHere1];
      signer1.tabs = new docusign.Tabs();
      signer1.tabs.signHereTabs = signHereTabs;

      const recipients = new docusign.Recipients();
      recipients.signers = [signer1];
      envelopeDefinition.recipients = recipients;

      // Create the envelope
      const results = await envelopesApi.createEnvelope(this.accountId, {
        envelopeDefinition: envelopeDefinition
      });

      if (results && results.envelopeId) {
        return {
          envelopeId: results.envelopeId,
          status: results.status || 'sent'
        };
      } else {
        throw new Error('Failed to create DocuSign envelope');
      }
    } catch (error) {
      console.error('DocuSign error:', error);
      throw new Error(`DocuSign agreement sending failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private getAgreementDocumentBase64(): string {
    // This is a placeholder - you would replace this with your actual PDF document
    // For now, we'll create a simple text document
    const agreementText = `
ASSET PROTECTION AGREEMENT

This agreement is between GuardPortal and the client for asset protection services.

Client agrees to the terms and conditions outlined in this document.

Signature: _____________________

Date: _____________________
    `;

    return Buffer.from(agreementText).toString('base64');
  }

  async getEnvelopeStatus(envelopeId: string): Promise<any> {
    try {
      const envelopesApi = new docusign.EnvelopesApi(this.apiClient);
      const results = await envelopesApi.getEnvelope(this.accountId, envelopeId);
      return results;
    } catch (error) {
      console.error('DocuSign get envelope status error:', error);
      throw new Error(`Failed to get envelope status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const docusignService = new DocusignService();