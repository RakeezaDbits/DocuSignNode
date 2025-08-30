import * as docusign from 'docusign-esign';

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
  private apiClient: any;
  private accountId: string;

  constructor() {
    this.accountId = process.env.DOCUSIGN_ACCOUNT_ID || '';
    // Temporarily disable DocuSign to get app running
    this.apiClient = null;
    console.log('DocuSign service disabled for development');
  }

  private async configureAuth(): Promise<void> {
    try {
      // Fallback to access token for now to avoid JWT key format issues
      const accessToken = process.env.DOCUSIGN_ACCESS_TOKEN;
      if (accessToken) {
        this.apiClient.addDefaultHeader('Authorization', `Bearer ${accessToken}`);
      } else {
        console.log('DocuSign access token not configured, DocuSign features will be disabled');
      }
    } catch (error) {
      console.error('DocuSign authentication error:', error);
      // Don't throw error, just log it so app can still start
    }
  }

  async sendAgreement(request: AgreementRequest): Promise<AgreementResult> {
    try {
      const envelopesApi = new docusign.EnvelopesApi(this.apiClient);

      // Create the envelope definition
      const envelopeDefinition = new docusign.EnvelopeDefinition();
      envelopeDefinition.emailSubject = 'GuardPortal Asset Protection Agreement - Please Sign';
      envelopeDefinition.status = 'sent';

      // Create document
      const document = new docusign.Document();
      document.documentBase64 = this.getAgreementTemplate(request);
      document.name = 'Asset Protection Service Agreement';
      document.fileExtension = 'pdf';
      document.documentId = '1';

      envelopeDefinition.documents = [document];

      // Create recipient
      const signer = new docusign.Signer();
      signer.email = request.recipientEmail;
      signer.name = request.recipientName;
      signer.recipientId = '1';
      signer.routingOrder = '1';

      // Add signature tab
      const signHere = new docusign.SignHere();
      signHere.anchorString = 'Signature:';
      signHere.anchorUnits = 'pixels';
      signHere.anchorXOffset = '20';
      signHere.anchorYOffset = '10';

      const tabs = new docusign.Tabs();
      tabs.signHereTabs = [signHere];
      signer.tabs = tabs;

      const recipients = new docusign.Recipients();
      recipients.signers = [signer];
      envelopeDefinition.recipients = recipients;

      // Create envelope
      const result = await envelopesApi.createEnvelope(this.accountId, {
        envelopeDefinition,
      });

      return {
        envelopeId: result.envelopeId || '',
        status: result.status || 'sent',
      };
    } catch (error) {
      console.error('DocuSign envelope creation error:', error);
      throw new Error(`Failed to send agreement: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private getAgreementTemplate(request: AgreementRequest): string {
    // This would be a base64 encoded PDF template in production
    // For now, we'll return a simple HTML-to-PDF conversion placeholder
    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 20px; }
            .signature-line { margin-top: 50px; border-bottom: 1px solid #000; width: 300px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>GuardPortal Asset & Title Protection Agreement</h1>
            <p>Service Agreement #${request.appointmentId}</p>
          </div>
          
          <div class="section">
            <h3>Agreement Details</h3>
            <p>This agreement establishes the terms for asset and title protection services between GuardPortal and ${request.recipientName}.</p>
          </div>
          
          <div class="section">
            <h3>Services Included</h3>
            <ul>
              <li>24/7 Property monitoring and surveillance</li>
              <li>Title fraud detection and alerts</li>
              <li>Asset documentation and protection</li>
              <li>Expert consultation and support</li>
            </ul>
          </div>
          
          <div class="section">
            <h3>Payment Terms</h3>
            <p>Monthly service fee: $100.00</p>
            <p>Initial setup and audit fee: $125.00</p>
            <p>Total initial payment: $225.00</p>
          </div>
          
          <div class="section">
            <h3>Terms and Conditions</h3>
            <p>By signing this agreement, you acknowledge that you have read and agree to the terms of service for GuardPortal's asset and title protection services.</p>
          </div>
          
          <div style="margin-top: 100px;">
            <p>Client Name: ${request.recipientName}</p>
            <p>Email: ${request.recipientEmail}</p>
            <p>Date: ${new Date().toLocaleDateString()}</p>
            
            <div style="margin-top: 50px;">
              <p>Signature: _________________________________</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // In production, convert HTML to PDF and return base64
    // For now, return base64 encoded HTML as placeholder
    return Buffer.from(htmlContent).toString('base64');
  }

  async getEnvelopeStatus(envelopeId: string): Promise<any> {
    try {
      const envelopesApi = new docusign.EnvelopesApi(this.apiClient);
      const result = await envelopesApi.getEnvelope(this.accountId, envelopeId);
      return result;
    } catch (error) {
      console.error('Error getting envelope status:', error);
      throw error;
    }
  }
}

export const docusignService = new DocusignService();
