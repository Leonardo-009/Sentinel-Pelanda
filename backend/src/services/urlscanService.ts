const fetch = require('node-fetch');

interface URLScanSubmissionResponse {
  message: string;
  uuid: string;
  visibility: string;
  options: any;
  url: string;
  country: string;
  api: string;
}

interface URLScanResultResponse {
  task: {
    uuid: string;
    time: string;
    url: string;
    visibility: string;
    options: any;
    method: string;
    source: string;
    userAgent: string;
    tags: string[];
  };
  stats: {
    uniqIPs: number;
    uniqCountries: number;
    dataLength: number;
    encodedDataLength: number;
    requests: number;
  };
  page: {
    country: string;
    server: string;
    city: string;
    domain: string;
    ip: string;
    asnname: string;
    asn: string;
    url: string;
    ptr: string;
  };
  lists: {
    ips: string[];
    countries: string[];
    asns: string[];
    domains: string[];
    servers: string[];
    urls: string[];
    linkDomains: string[];
    certificates: any[];
    hashes: string[];
  };
  verdicts: {
    overall: {
      score: number;
      categories: string[];
      brands: string[];
      tags: string[];
      malicious: boolean;
      hasVerdicts: boolean;
    };
    urlscan: {
      score: number;
      categories: string[];
      brands: string[];
      tags: string[];
      malicious: boolean;
    };
    engines: {
      score: number;
      categories: string[];
      brands: string[];
      tags: string[];
      malicious: boolean;
    };
    community: {
      score: number;
      categories: string[];
      brands: string[];
      tags: string[];
      malicious: boolean;
      votesMalicious: number;
      votesHarmless: number;
      votesTotal: number;
    };
  };
  meta: {
    processors: {
      umbrella: {
        data: any[];
      };
    };
  };
}

interface PhishingAnalysisResult {
  value: string;
  status: 'malicious' | 'suspicious' | 'clean';
  confidence: number;
  detections: number;
  source: string;
  details: {
    screenshot?: string;
    scan_id: string;
    phishing_score: number;
    brand_detected?: string;
    certificate_info?: {
      valid: boolean;
      issuer?: string;
      subject?: string;
    };
    domain_age?: number;
    technologies?: string[];
    redirects?: string[];
    suspicious_forms?: number;
    external_links?: number;
    error_message?: string;
    urlscan_links: {
      result_url: string;
      screenshot_url?: string;
      dom_url?: string;
    };
    network_info: {
      ips: string[];
      domains: string[];
      countries: string[];
      asns: string[];
      servers: string[];
    };
    page_info: {
      title?: string;
      domain: string;
      ip?: string;
      country?: string;
      city?: string;
      server?: string;
      asn?: string;
      asnname?: string;
    };
    statistics: {
      requests: number;
      unique_ips: number;
      unique_countries: number;
      data_length: number;
    };
    verdicts_detail: {
      urlscan: {
        score: number;
        malicious: boolean;
        categories: string[];
        brands: string[];
      };
      engines: {
        score: number;
        malicious: boolean;
        categories: string[];
        brands: string[];
      };
      community: {
        score: number;
        malicious: boolean;
        votes_malicious: number;
        votes_harmless: number;
        votes_total: number;
      };
    };
    overall_verdict: {
      score: number;
      malicious: boolean;
      categories: string[];
      brands: string[];
    };
  };
}

class URLScanService {
  private apiKey: string;
  private baseUrl = 'https://urlscan.io/api/v1';

  constructor() {
    this.apiKey = process.env.URLSCAN_API_KEY || '';
    console.log('URLScan API Key configured:', !!this.apiKey);
    if (!this.apiKey) {
      console.warn('URLScan API key not configured');
    } else {
      console.log('URLScan API Key length:', this.apiKey.length);
    }
  }

  private async submitURL(url: string): Promise<URLScanSubmissionResponse> {
    const response = await fetch(`${this.baseUrl}/scan/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'API-Key': this.apiKey,
      },
      body: JSON.stringify({
        url: url,
        visibility: 'unlisted', // Para privacidade
        tags: ['phishing-analysis', 'sentinel-pelanda']
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit exceeded for URLScan API');
      }
      throw new Error(`URLScan submission failed: ${response.statusText}`);
    }

    return response.json() as Promise<URLScanSubmissionResponse>;
  }

  private async getResult(uuid: string): Promise<URLScanResultResponse | null> {
    const response = await fetch(`${this.baseUrl}/result/${uuid}/`);

    if (response.status === 404) {
      // Scan ainda não terminou
      return null;
    }

    if (!response.ok) {
      throw new Error(`URLScan result failed: ${response.statusText}`);
    }

    return response.json() as Promise<URLScanResultResponse>;
  }

  private async getScreenshot(uuid: string): Promise<string | null> {
    try {
      const response = await fetch(`https://urlscan.io/screenshots/${uuid}.png`);
      
      if (response.ok) {
        return `https://urlscan.io/screenshots/${uuid}.png`;
      }
      return null;
    } catch (error) {
      console.warn(`Screenshot not available for ${uuid}:`, error);
      return null;
    }
  }

  private async waitForResult(uuid: string, maxAttempts = 12): Promise<URLScanResultResponse | null> {
    // Esperar 15 segundos antes da primeira tentativa
    await new Promise(resolve => setTimeout(resolve, 15000));

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const result = await this.getResult(uuid);
        if (result) {
          return result;
        }
        
        // Esperar 5 segundos entre tentativas
        await new Promise(resolve => setTimeout(resolve, 5000));
      } catch (error) {
        console.warn(`Attempt ${attempt + 1} failed:`, error);
        if (attempt === maxAttempts - 1) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    return null;
  }

  private calculatePhishingScore(verdicts: URLScanResultResponse['verdicts']): number {
    const overallScore = verdicts.overall.score;
    const maliciousIndicator = verdicts.overall.malicious ? 30 : 0;
    const categoryBonus = verdicts.overall.categories.length * 5;
    const brandBonus = verdicts.overall.brands.length * 10;
    
    return Math.min(100, overallScore + maliciousIndicator + categoryBonus + brandBonus);
  }

  private determineStatus(score: number, malicious: boolean): 'malicious' | 'suspicious' | 'clean' {
    if (malicious || score >= 75) {
      return 'malicious';
    } else if (score >= 40) {
      return 'suspicious';
    } else {
      return 'clean';
    }
  }

  private extractTechnologies(result: URLScanResultResponse): string[] {
    // Extrair tecnologias dos headers do servidor e outros indicadores
    const technologies: string[] = [];
    
    if (result.page.server) {
      technologies.push(result.page.server);
    }
    
    // Adicionar outras tecnologias detectadas se disponíveis
    // Nota: URLScan não fornece tecnologias diretamente como Wappalyzer
    // mas podemos inferir de outros dados
    
    return technologies.filter(tech => tech && tech.length > 0);
  }

  private countSuspiciousForms(result: URLScanResultResponse): number {
    // Implementar lógica para contar formulários suspeitos
    // Baseado em padrões comuns de phishing (campos de senha, login, etc.)
    return 0; // Placeholder - implementar baseado nos dados disponíveis
  }

  async analyzeURL(url: string): Promise<PhishingAnalysisResult> {
    try {
      // Submeter URL para análise
      const submission = await this.submitURL(url);
      
      // Aguardar resultado
      const result = await this.waitForResult(submission.uuid);
      
      if (!result) {
        throw new Error('Timeout waiting for URLScan result');
      }

      // Obter screenshot
      const screenshot = await this.getScreenshot(submission.uuid);

      // Calcular score de phishing
      const phishingScore = this.calculatePhishingScore(result.verdicts);
      
      // Determinar status
      const status = this.determineStatus(phishingScore, result.verdicts.overall.malicious);

      // Extrair tecnologias
      const technologies = this.extractTechnologies(result);

      return {
        value: url,
        status,
        confidence: Math.min(95, 60 + (phishingScore * 0.35)), // Converter score em confiança
        detections: result.verdicts.overall.categories.length,
        source: 'URLScan.io',
        details: {
          screenshot: screenshot || undefined,
          scan_id: submission.uuid,
          phishing_score: phishingScore,
          brand_detected: result.verdicts.overall.brands.length > 0 ? result.verdicts.overall.brands[0] : undefined,
          certificate_info: {
            valid: result.lists.certificates.length > 0,
            issuer: result.lists.certificates.length > 0 ? result.lists.certificates[0].issuer : undefined,
            subject: result.lists.certificates.length > 0 ? result.lists.certificates[0].subject : undefined,
          },
          technologies,
          redirects: result.lists.urls.slice(1), // URLs além da original são redirecionamentos
          suspicious_forms: this.countSuspiciousForms(result),
          external_links: result.lists.domains.length,
          urlscan_links: {
            result_url: `https://urlscan.io/result/${submission.uuid}/`,
            screenshot_url: screenshot || undefined,
            dom_url: `https://urlscan.io/dom/${submission.uuid}/`,
          },
          network_info: {
            ips: result.lists.ips || [],
            domains: result.lists.domains || [],
            countries: result.lists.countries || [],
            asns: result.lists.asns || [],
            servers: result.lists.servers || [],
          },
          page_info: {
            title: result.task.url,
            domain: result.page.domain,
            ip: result.page.ip,
            country: result.page.country,
            city: result.page.city,
            server: result.page.server,
            asn: result.page.asn,
            asnname: result.page.asnname,
          },
          statistics: {
            requests: result.stats.requests,
            unique_ips: result.stats.uniqIPs,
            unique_countries: result.stats.uniqCountries,
            data_length: result.stats.dataLength,
          },
          verdicts_detail: {
            urlscan: {
              score: result.verdicts.urlscan.score,
              malicious: result.verdicts.urlscan.malicious,
              categories: result.verdicts.urlscan.categories,
              brands: result.verdicts.urlscan.brands,
            },
            engines: {
              score: result.verdicts.engines.score,
              malicious: result.verdicts.engines.malicious,
              categories: result.verdicts.engines.categories,
              brands: result.verdicts.engines.brands,
            },
            community: {
              score: result.verdicts.community.score,
              malicious: result.verdicts.community.malicious,
              votes_malicious: result.verdicts.community.votesMalicious,
              votes_harmless: result.verdicts.community.votesHarmless,
              votes_total: result.verdicts.community.votesTotal,
            },
          },
          overall_verdict: {
            score: result.verdicts.overall.score,
            malicious: result.verdicts.overall.malicious,
            categories: result.verdicts.overall.categories,
            brands: result.verdicts.overall.brands,
          }
        }
      };
    } catch (error) {
      console.error('URLScan analysis failed for URL:', url, 'Error:', error);
      
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      // Retornar resultado de fallback com mais informações
      return {
        value: url,
        status: 'clean',
        confidence: 0,
        detections: 0,
        source: 'URLScan.io',
        details: {
          scan_id: '',
          phishing_score: 0,
          error_message: errorMessage,
          urlscan_links: {
            result_url: `https://urlscan.io/search/#${encodeURIComponent(url)}`,
          },
          network_info: {
            ips: [],
            domains: [],
            countries: [],
            asns: [],
            servers: [],
          },
          page_info: {
            domain: url,
          },
          statistics: {
            requests: 0,
            unique_ips: 0,
            unique_countries: 0,
            data_length: 0,
          },
          verdicts_detail: {
            urlscan: {
              score: 0,
              malicious: false,
              categories: [],
              brands: [],
            },
            engines: {
              score: 0,
              malicious: false,
              categories: [],
              brands: [],
            },
            community: {
              score: 0,
              malicious: false,
              votes_malicious: 0,
              votes_harmless: 0,
              votes_total: 0,
            },
          },
          overall_verdict: {
            score: 0,
            malicious: false,
            categories: [],
            brands: [],
          }
        }
      };
    }
  }

  async analyzeMultipleURLs(urls: string[]): Promise<PhishingAnalysisResult[]> {
    const results: PhishingAnalysisResult[] = [];
    
    // Processar URLs em lotes para respeitar rate limits
    const batchSize = 3;
    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize);
      
      const batchPromises = batch.map(url => this.analyzeURL(url));
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          console.error(`Failed to analyze ${batch[index]}:`, result.reason);
          // Adicionar resultado de erro
          results.push({
            value: batch[index],
            status: 'clean',
            confidence: 0,
            detections: 0,
            source: 'URLScan.io',
            details: {
              scan_id: '',
              phishing_score: 0,
              urlscan_links: {
                result_url: `https://urlscan.io/search/#${encodeURIComponent(batch[index])}`,
              },
              network_info: {
                ips: [],
                domains: [],
                countries: [],
                asns: [],
                servers: [],
              },
              page_info: {
                domain: batch[index],
              },
              statistics: {
                requests: 0,
                unique_ips: 0,
                unique_countries: 0,
                data_length: 0,
              },
              verdicts_detail: {
                urlscan: {
                  score: 0,
                  malicious: false,
                  categories: [],
                  brands: [],
                },
                engines: {
                  score: 0,
                  malicious: false,
                  categories: [],
                  brands: [],
                },
                community: {
                  score: 0,
                  malicious: false,
                  votes_malicious: 0,
                  votes_harmless: 0,
                  votes_total: 0,
                },
              },
              overall_verdict: {
                score: 0,
                malicious: false,
                categories: [],
                brands: [],
              }
            }
          });
        }
      });
      
      // Pausa entre lotes para respeitar rate limits
      if (i + batchSize < urls.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    return results;
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }
}

export const urlscanService = new URLScanService();
export type { PhishingAnalysisResult };

