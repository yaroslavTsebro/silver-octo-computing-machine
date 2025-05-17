import crypto from 'crypto';

class Signer {
  constructor(private secretKey: string) { }

  sign(method: string, host: string, path: string, parameters: string): string {
    const payload = `${method}\n${host}\n${path}\n${parameters}`;
    return crypto.createHmac('sha256', this.secretKey).update(payload).digest('base64');
  }
}

class Ed25519Signer {
  private privateKey: crypto.KeyObject;

  constructor(privateKeyPem: string) {
    this.privateKey = crypto.createPrivateKey({
      key: privateKeyPem,
      format: 'pem',
    });
  }

  sign(method: string, host: string, path: string, parameters: string): string {
    const payload = `${method}\n${host}\n${path}\n${parameters}`;
    const signature = crypto.sign(null, Buffer.from(payload), this.privateKey);
    return signature.toString('base64');
  }
}

interface RequestParams {
  [key: string]: string;
}

export class PrivateUrlBuilder {
  private signer: Signer | Ed25519Signer;
  private params: RequestParams;

  constructor(
    private accessKey: string,
    secretKey: string,
    private host: string,
    signatureMethod: '256' | 'ed25519',
  ) {
    this.params = {
      AccessKeyId: this.accessKey,
      SignatureMethod: signatureMethod === '256' ? 'HmacSHA256' : 'Ed25519',
      SignatureVersion: '2',
    };

    this.signer =
      signatureMethod === '256' ? new Signer(secretKey) : new Ed25519Signer(secretKey);
  }

  build(method: string, path: string, extraParams: RequestParams = {}): string {
    const utcDate = new Date().toISOString().split('.')[0];
    const params = {
      ...this.params,
      Timestamp: utcDate,
      ...extraParams,
    };

    const parameters = new URLSearchParams(params).toString();
    const signature = this.signer.sign(method, this.host, path, parameters);

    return `https://${this.host}${path}?${parameters}&Signature=${encodeURIComponent(signature)}`;
  }
}