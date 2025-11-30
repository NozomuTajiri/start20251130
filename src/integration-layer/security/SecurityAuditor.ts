/**
 * Security Auditor
 * 6.4 セキュリティ監査
 */

import type {
  SecurityAudit,
  Vulnerability,
  SecurityRecommendation,
  ComplianceReport,
  ComplianceFramework,
  ComplianceControl,
} from '../types';

/**
 * セキュリティスキャナー
 */
export class SecurityScanner {
  private scanners: Map<string, ScannerPlugin> = new Map();

  constructor() {
    this.initializeDefaultScanners();
  }

  private initializeDefaultScanners(): void {
    this.registerScanner({
      id: 'dependency-check',
      name: 'Dependency Vulnerability Scanner',
      scan: async () => this.scanDependencies(),
    });

    this.registerScanner({
      id: 'code-analysis',
      name: 'Static Code Analysis Scanner',
      scan: async () => this.scanCode(),
    });

    this.registerScanner({
      id: 'secrets-detection',
      name: 'Secrets Detection Scanner',
      scan: async () => this.scanSecrets(),
    });

    this.registerScanner({
      id: 'config-audit',
      name: 'Configuration Audit Scanner',
      scan: async () => this.scanConfiguration(),
    });
  }

  registerScanner(plugin: ScannerPlugin): void {
    this.scanners.set(plugin.id, plugin);
  }

  async runAllScanners(): Promise<Vulnerability[]> {
    const results: Vulnerability[] = [];

    for (const scanner of this.scanners.values()) {
      const vulnerabilities = await scanner.scan();
      results.push(...vulnerabilities);
    }

    return results;
  }

  async runScanner(scannerId: string): Promise<Vulnerability[]> {
    const scanner = this.scanners.get(scannerId);
    if (!scanner) {
      throw new Error(`Scanner '${scannerId}' not found`);
    }
    return scanner.scan();
  }

  private async scanDependencies(): Promise<Vulnerability[]> {
    // シミュレーション: 依存関係の脆弱性スキャン
    return [
      {
        id: 'DEP-001',
        title: 'Prototype Pollution in lodash',
        description: 'lodash < 4.17.21 に prototype pollution 脆弱性があります',
        category: 'dependencies',
        severity: 'medium',
        cvss: 6.5,
        cve: 'CVE-2021-23337',
        affected: [{ type: 'package', path: 'node_modules/lodash', version: '4.17.20' }],
        remediation: 'lodash を 4.17.21 以上にアップグレードしてください',
        references: ['https://nvd.nist.gov/vuln/detail/CVE-2021-23337'],
        discovered: new Date(),
        status: 'open',
      },
    ];
  }

  private async scanCode(): Promise<Vulnerability[]> {
    // シミュレーション: 静的コード解析
    return [
      {
        id: 'CODE-001',
        title: 'Potential SQL Injection',
        description: '動的クエリ構築にパラメータバインディングを使用していない可能性があります',
        category: 'injection',
        severity: 'high',
        affected: [{ type: 'file', path: 'src/data-layer/connectors/BaseConnector.ts', line: 45 }],
        remediation: 'パラメータ化クエリまたはORMを使用してください',
        references: ['https://owasp.org/www-community/attacks/SQL_Injection'],
        discovered: new Date(),
        status: 'open',
      },
    ];
  }

  private async scanSecrets(): Promise<Vulnerability[]> {
    // シミュレーション: シークレット検出
    return [
      {
        id: 'SECRET-001',
        title: 'Hardcoded API Key Detected',
        description: 'コード内にハードコードされたAPIキーが検出されました',
        category: 'dataExposure',
        severity: 'critical',
        affected: [{ type: 'file', path: 'src/config.example.ts', line: 12 }],
        remediation: '環境変数または秘密管理サービスを使用してください',
        references: ['https://owasp.org/www-project-web-security-testing-guide/'],
        discovered: new Date(),
        status: 'open',
      },
    ];
  }

  private async scanConfiguration(): Promise<Vulnerability[]> {
    // シミュレーション: 設定監査
    return [
      {
        id: 'CONFIG-001',
        title: 'CORS Misconfiguration',
        description: 'CORSが全てのオリジンを許可しています',
        category: 'configuration',
        severity: 'medium',
        affected: [{ type: 'configuration', path: 'next.config.js' }],
        remediation: '許可するオリジンを明示的に指定してください',
        references: ['https://owasp.org/www-community/attacks/CORS_OriginHeaderScrutiny'],
        discovered: new Date(),
        status: 'open',
      },
    ];
  }
}

/**
 * コンプライアンスチェッカー
 */
export class ComplianceChecker {
  private frameworks: Map<string, ComplianceFramework> = new Map();

  constructor() {
    this.initializeFrameworks();
  }

  private initializeFrameworks(): void {
    // OWASP Top 10
    this.registerFramework({
      name: 'OWASP Top 10',
      version: '2021',
      score: 0,
      controls: this.createOWASPControls(),
    });

    // SOC 2 Type II
    this.registerFramework({
      name: 'SOC 2 Type II',
      version: '2017',
      score: 0,
      controls: this.createSOC2Controls(),
    });

    // GDPR
    this.registerFramework({
      name: 'GDPR',
      version: '2018',
      score: 0,
      controls: this.createGDPRControls(),
    });
  }

  registerFramework(framework: ComplianceFramework): void {
    this.frameworks.set(framework.name, framework);
  }

  async checkCompliance(frameworkName?: string): Promise<ComplianceReport> {
    let frameworksToCheck: ComplianceFramework[];

    if (frameworkName) {
      const framework = this.frameworks.get(frameworkName);
      if (!framework) {
        throw new Error(`Framework '${frameworkName}' not found`);
      }
      frameworksToCheck = [framework];
    } else {
      frameworksToCheck = Array.from(this.frameworks.values());
    }

    const evaluatedFrameworks = frameworksToCheck.map((f) => this.evaluateFramework(f));
    const overallScore =
      evaluatedFrameworks.reduce((sum, f) => sum + f.score, 0) / evaluatedFrameworks.length;

    return {
      frameworks: evaluatedFrameworks,
      overallScore,
      compliant: overallScore >= 80,
    };
  }

  private evaluateFramework(framework: ComplianceFramework): ComplianceFramework {
    const evaluatedControls = framework.controls.map((control) => ({
      ...control,
      status: this.evaluateControl(control),
    }));

    const compliantCount = evaluatedControls.filter(
      (c) => c.status === 'compliant' || c.status === 'notApplicable'
    ).length;
    const totalApplicable = evaluatedControls.filter((c) => c.status !== 'notApplicable').length;
    const score = totalApplicable > 0 ? (compliantCount / totalApplicable) * 100 : 100;

    return {
      ...framework,
      controls: evaluatedControls,
      score,
    };
  }

  private evaluateControl(
    _control: ComplianceControl
  ): 'compliant' | 'nonCompliant' | 'partial' | 'notApplicable' {
    // シミュレーション: コントロールの評価
    // 実際にはシステムの状態を検査
    const random = Math.random();
    if (random > 0.8) return 'compliant';
    if (random > 0.6) return 'partial';
    if (random > 0.4) return 'nonCompliant';
    return 'compliant'; // デフォルトは準拠
  }

  private createOWASPControls(): ComplianceControl[] {
    return [
      {
        id: 'A01',
        name: 'Broken Access Control',
        description: 'アクセス制御の不備',
        status: 'compliant',
        evidence: ['RBAC実装', '認可チェック'],
      },
      {
        id: 'A02',
        name: 'Cryptographic Failures',
        description: '暗号化の失敗',
        status: 'compliant',
        evidence: ['TLS 1.3使用', 'AES-256暗号化'],
      },
      {
        id: 'A03',
        name: 'Injection',
        description: 'インジェクション攻撃',
        status: 'compliant',
        evidence: ['パラメータ化クエリ', '入力検証'],
      },
      {
        id: 'A04',
        name: 'Insecure Design',
        description: '安全でない設計',
        status: 'compliant',
        evidence: ['脅威モデリング実施', 'セキュリティレビュー'],
      },
      {
        id: 'A05',
        name: 'Security Misconfiguration',
        description: 'セキュリティ設定ミス',
        status: 'partial',
        evidence: ['一部設定見直し必要'],
      },
    ];
  }

  private createSOC2Controls(): ComplianceControl[] {
    return [
      {
        id: 'CC1.1',
        name: 'Control Environment',
        description: '統制環境の整備',
        status: 'compliant',
        evidence: ['ポリシー文書化', '責任明確化'],
      },
      {
        id: 'CC2.1',
        name: 'Communication and Information',
        description: '情報と伝達',
        status: 'compliant',
        evidence: ['セキュリティ教育', '定期レビュー'],
      },
      {
        id: 'CC3.1',
        name: 'Risk Assessment',
        description: 'リスク評価',
        status: 'compliant',
        evidence: ['年次リスク評価', '脅威分析'],
      },
    ];
  }

  private createGDPRControls(): ComplianceControl[] {
    return [
      {
        id: 'Art5',
        name: 'Data Processing Principles',
        description: 'データ処理の原則',
        status: 'compliant',
        evidence: ['プライバシーポリシー', '同意管理'],
      },
      {
        id: 'Art17',
        name: 'Right to Erasure',
        description: '消去の権利',
        status: 'compliant',
        evidence: ['データ削除機能', '監査ログ'],
      },
      {
        id: 'Art32',
        name: 'Security of Processing',
        description: '処理のセキュリティ',
        status: 'compliant',
        evidence: ['暗号化', 'アクセス制御'],
      },
    ];
  }
}

/**
 * セキュリティ監査人
 */
export class SecurityAuditor {
  private scanner: SecurityScanner;
  private complianceChecker: ComplianceChecker;
  private auditHistory: SecurityAudit[] = [];

  constructor() {
    this.scanner = new SecurityScanner();
    this.complianceChecker = new ComplianceChecker();
  }

  /**
   * 完全な監査を実行
   */
  async runFullAudit(): Promise<SecurityAudit> {
    const startTime = Date.now();
    const auditId = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      // 脆弱性スキャン
      const vulnerabilities = await this.scanner.runAllScanners();

      // コンプライアンスチェック
      const compliance = await this.complianceChecker.checkCompliance();

      // スコア計算
      const score = this.calculateSecurityScore(vulnerabilities, compliance);

      // 推奨事項生成
      const recommendations = this.generateRecommendations(vulnerabilities, compliance);

      const audit: SecurityAudit = {
        id: auditId,
        timestamp: new Date(),
        duration: Date.now() - startTime,
        status: 'completed',
        score,
        vulnerabilities,
        recommendations,
        compliance,
      };

      this.auditHistory.push(audit);
      return audit;
    } catch (error) {
      const failedAudit: SecurityAudit = {
        id: auditId,
        timestamp: new Date(),
        duration: Date.now() - startTime,
        status: 'failed',
        score: 0,
        vulnerabilities: [],
        recommendations: [],
        compliance: { frameworks: [], overallScore: 0, compliant: false },
      };

      this.auditHistory.push(failedAudit);
      throw error;
    }
  }

  /**
   * クイックスキャンを実行
   */
  async runQuickScan(): Promise<Vulnerability[]> {
    return this.scanner.runScanner('dependency-check');
  }

  /**
   * セキュリティスコアを計算
   */
  private calculateSecurityScore(
    vulnerabilities: Vulnerability[],
    compliance: ComplianceReport
  ): number {
    let score = 100;

    // 脆弱性によるペナルティ
    vulnerabilities.forEach((v) => {
      switch (v.severity) {
        case 'critical':
          score -= 20;
          break;
        case 'high':
          score -= 10;
          break;
        case 'medium':
          score -= 5;
          break;
        case 'low':
          score -= 2;
          break;
        default:
          score -= 1;
      }
    });

    // コンプライアンススコアの加重
    score = score * 0.6 + compliance.overallScore * 0.4;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * 推奨事項を生成
   */
  private generateRecommendations(
    vulnerabilities: Vulnerability[],
    compliance: ComplianceReport
  ): SecurityRecommendation[] {
    const recommendations: SecurityRecommendation[] = [];

    // 脆弱性からの推奨事項
    const criticalVulns = vulnerabilities.filter((v) => v.severity === 'critical');
    if (criticalVulns.length > 0) {
      recommendations.push({
        id: 'rec-critical',
        priority: 'critical',
        title: '重大な脆弱性の即時対応',
        description: `${criticalVulns.length}件の重大な脆弱性が検出されました。即座に対応が必要です。`,
        impact: 'システム全体のセキュリティに重大な影響',
        effort: 'high',
        category: 'vulnerability',
      });
    }

    const highVulns = vulnerabilities.filter((v) => v.severity === 'high');
    if (highVulns.length > 0) {
      recommendations.push({
        id: 'rec-high',
        priority: 'high',
        title: '高リスク脆弱性の対応',
        description: `${highVulns.length}件の高リスク脆弱性が検出されました。早急な対応が必要です。`,
        impact: '潜在的なデータ漏洩またはシステム侵害',
        effort: 'medium',
        category: 'vulnerability',
      });
    }

    // コンプライアンスからの推奨事項
    compliance.frameworks.forEach((framework) => {
      const nonCompliant = framework.controls.filter((c) => c.status === 'nonCompliant');
      if (nonCompliant.length > 0) {
        recommendations.push({
          id: `rec-compliance-${framework.name}`,
          priority: 'medium',
          title: `${framework.name} コンプライアンス改善`,
          description: `${nonCompliant.length}件のコントロールが非準拠です。`,
          impact: 'コンプライアンス違反のリスク',
          effort: 'medium',
          category: 'compliance',
        });
      }
    });

    // 一般的な推奨事項
    recommendations.push({
      id: 'rec-general-1',
      priority: 'info',
      title: '定期的なセキュリティ監査',
      description: '月次でのセキュリティ監査実施を推奨します。',
      impact: '継続的なセキュリティ改善',
      effort: 'low',
      category: 'process',
    });

    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  /**
   * 監査履歴を取得
   */
  getAuditHistory(): SecurityAudit[] {
    return [...this.auditHistory];
  }

  /**
   * 最新の監査を取得
   */
  getLatestAudit(): SecurityAudit | undefined {
    return this.auditHistory[this.auditHistory.length - 1];
  }
}

interface ScannerPlugin {
  id: string;
  name: string;
  scan: () => Promise<Vulnerability[]>;
}

// シングルトンインスタンス
export const securityScanner = new SecurityScanner();
export const complianceChecker = new ComplianceChecker();
export const securityAuditor = new SecurityAuditor();
