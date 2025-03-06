// 词条类型常量
export const ATTACK_PERCENTAGE = "AttackPercentage";
export const CRITICAL = "Critical";
export const EXPLOSIVE_INJURY = "ExplosiveInjury";
export const INCREASED_DAMAGE = "IncreasedDamage";

// 基础属性类
export class Basic {
  constructor(
    public basicAttack: number,
    public basicCritical: number,
    public basicExplosiveInjury: number,
    public basicIncreasedDamage: number,
    public basicReductionResistance: number,
    public basicVulnerable: number,
    public basicSpecialDamage: number
  ) {}
}

// 增益属性类
export class Gain {
  constructor(
    public attackValue: number,
    public attackPowerPercentage: number,
    public attackInternalPercentage: number,
    public critical: number,
    public explosiveInjury: number,
    public increasedDamage: number,
    public reductionResistance: number,
    public vulnerable: number,
    public specialDamage: number
  ) {}
}

// 防御属性类
export class Defense {
  constructor(
    public penetration: number,
    public defenseBreak: number,
    public penetrationValue: number
  ) {}
}

// 条件属性类
export class Condition {
  criticalStatus: number = 0;
  criticalCount: number = 0;

  constructor(
    public mainArticle: number,
    public critical: number
  ) {}
}

// 输出结果类
export class Output {
  basicDamageArea: number = 0;
  increasedDamageArea: number = 0;
  explosiveInjuryArea: number = 0;
  defenseArea: number = 0;
  reductionResistanceArea: number = 0;
  vulnerableArea: number = 0;
  specialDamageArea: number = 0;
}

// 当前面板类
export class CurrentPanel {
  constructor(
    public attack: number = 0,
    public critical: number = 0,
    public explosiveInjury: number = 0,
    public increasedDamage: number = 0,
    public reductionResistance: number = 0,
    public vulnerable: number = 0,
    public specialDamage: number = 0
  ) {}
}

// 倍率类
export class Magnification {
  constructor(
    public magnificationValue: number,
    public triggerTimes: number,
    public name: string,
    public increasedDamage: number = 0,
    public reductionResistance: number = 0,
    public defenseBreak: number = 0,
    public penetration: number = 0,
    public specialDamage: number = 0
  ) {}
}

// 初始化类
export class Initialization {
  output: Output;
  currentPanel: CurrentPanel;

  constructor(
    public basic: Basic,
    public gain: Gain,
    public defense: Defense,
    public condition: Condition,
    public magnifications: Magnification[]
  ) {
    this.output = new Output();
    this.currentPanel = new CurrentPanel();
    this.currentPanel.reductionResistance = this.basic.basicReductionResistance + this.gain.reductionResistance;
    this.currentPanel.vulnerable = this.basic.basicVulnerable + this.gain.vulnerable;
    this.currentPanel.specialDamage = this.basic.basicSpecialDamage + this.gain.specialDamage;
    this.handleBasicAttack("", 0);
    this.handleBasicCritical("", 0);
    this.handleBasicExplosiveInjury("", 0);
    this.handleBasicIncreasedDamage("", 0);
  }

  characterPanel(key: string, count: number) {
    this.currentPanel = new CurrentPanel();
    this.currentPanel.reductionResistance = this.basic.basicReductionResistance + this.gain.reductionResistance;
    this.currentPanel.vulnerable = this.basic.basicVulnerable + this.gain.vulnerable;
    this.currentPanel.specialDamage = this.basic.basicSpecialDamage + this.gain.specialDamage;
    this.handleBasicAttack(key, count);
    this.handleBasicExplosiveInjury(key, count);
    this.handleBasicCritical(key, count);
    this.handleBasicIncreasedDamage(key, count);
  }

  handleBasicAttack(key: string, count: number) {
    let attackPowerPercentage = this.gain.attackPowerPercentage;
    if (key === ATTACK_PERCENTAGE) {
      attackPowerPercentage += 3 * count;
    }
    this.currentPanel.attack = (this.basic.basicAttack * (1 + attackPowerPercentage / 100) + this.gain.attackValue) *
      (1 + this.gain.attackInternalPercentage / 100);
  }

  handleBasicCritical(key: string, count: number) {
    if (key === CRITICAL) {
      let crit = this.basic.basicCritical + this.gain.critical + 2.4 * count;
      if (crit > this.condition.critical) {
        this.condition.criticalStatus++;
        this.currentPanel.critical = this.basic.basicCritical + this.gain.critical + 2.4 * (count - this.condition.criticalStatus);
        this.currentPanel.explosiveInjury = this.currentPanel.explosiveInjury + this.condition.criticalStatus * 4.8;
      } else {
        this.condition.criticalCount = count;
        this.currentPanel.critical = crit;
      }
    } else {
      this.currentPanel.critical = this.basic.basicCritical + this.gain.critical;
    }
  }

  handleBasicExplosiveInjury(key: string, count: number) {
    let explosiveInjury = this.gain.explosiveInjury;
    if (key === EXPLOSIVE_INJURY) {
      explosiveInjury += 4.8 * count;
    }
    this.currentPanel.explosiveInjury = this.basic.basicExplosiveInjury + explosiveInjury;
  }

  handleBasicIncreasedDamage(key: string, count: number) {
    let increasedDamage = this.gain.increasedDamage;
    if (key === INCREASED_DAMAGE) {
      increasedDamage += 3 * count;
    }
    this.currentPanel.increasedDamage = this.basic.basicIncreasedDamage + increasedDamage;
  }

  basicDamageArea(mag: Magnification) {
    this.output.basicDamageArea = this.currentPanel.attack * mag.magnificationValue / 100 * mag.triggerTimes;
  }

  increasedDamageArea(mag: Magnification) {
    this.output.increasedDamageArea = 1 + ((mag.increasedDamage || 0) + this.currentPanel.increasedDamage) / 100;
  }

  explosiveInjuryArea() {
    this.output.explosiveInjuryArea = 1 + (this.currentPanel.critical * this.currentPanel.explosiveInjury) / 10000;
  }

  defenseArea(mag: Magnification) {
    const characterBase = 793.783;
    const totalDefense = 873.1613;
    let penetration = (this.defense.penetration - (mag.penetration || 0)) / 100;
    let defenseBreak = (this.defense.defenseBreak - (mag.defenseBreak || 0)) / 100;
    this.output.defenseArea = characterBase / (totalDefense * (1 - penetration) * (1 - defenseBreak) - this.defense.penetrationValue + characterBase);
  }

  reductionResistanceArea(mag: Magnification) {
    this.output.reductionResistanceArea = 1 + ((mag.reductionResistance || 0) + this.currentPanel.reductionResistance) / 100;
  }

  vulnerableArea() {
    this.output.vulnerableArea = 1 + this.currentPanel.vulnerable / 100;
  }

  specialDamageArea() {
    this.output.specialDamageArea = 1 + this.currentPanel.specialDamage / 100;
  }

  initializationArea(mag: Magnification) {
    this.basicDamageArea(mag);
    this.increasedDamageArea(mag);
    this.explosiveInjuryArea();
    this.defenseArea(mag);
    this.reductionResistanceArea(mag);
    this.vulnerableArea();
    this.specialDamageArea();
  }

  calculatingTotalDamage(): number {
    let totalDamage = 0;
    for (let mag of this.magnifications) {
      this.initializationArea(mag);
      let damage = this.output.basicDamageArea *
        this.output.increasedDamageArea *
        this.output.explosiveInjuryArea *
        this.output.defenseArea *
        this.output.reductionResistanceArea *
        this.output.vulnerableArea *
        this.output.specialDamageArea *
        (1 + (mag.specialDamage || 0) / 100);
      totalDamage += damage;
    }
    return totalDamage;
  }

  getMaxFloat(mainArticleDamageMap: Record<string, any[]>): string {
    let log = "";
    let entriesMap: Record<string, number> = {
      [ATTACK_PERCENTAGE]: 0,
      [CRITICAL]: 0,
      [EXPLOSIVE_INJURY]: 0,
      [INCREASED_DAMAGE]: 0,
      [CRITICAL + "--"]: 0
    };
    
    let criticalStatus = false;
    
    for (let a = 0; a < this.condition.mainArticle; a++) {
      let optimal = CRITICAL;
      let optimalKey = CRITICAL + "--";
      
      if (mainArticleDamageMap[optimal][entriesMap[optimalKey]].PercentageDifference <
          mainArticleDamageMap[ATTACK_PERCENTAGE][entriesMap[ATTACK_PERCENTAGE]].PercentageDifference) {
        optimal = ATTACK_PERCENTAGE;
        optimalKey = ATTACK_PERCENTAGE;
      }
      
      if (mainArticleDamageMap[optimal][entriesMap[optimalKey]].PercentageDifference <
          mainArticleDamageMap[EXPLOSIVE_INJURY][entriesMap[EXPLOSIVE_INJURY]].PercentageDifference) {
        optimal = EXPLOSIVE_INJURY;
        optimalKey = EXPLOSIVE_INJURY;
      }
      
      if (mainArticleDamageMap[optimal][entriesMap[optimalKey]].PercentageDifference <
          mainArticleDamageMap[INCREASED_DAMAGE][entriesMap[INCREASED_DAMAGE]].PercentageDifference) {
        optimal = INCREASED_DAMAGE;
        optimalKey = INCREASED_DAMAGE;
      }

      let explosiveInjuryStatus = false;
      if (optimal === CRITICAL) {
        entriesMap[CRITICAL + "--"]++;
        if (criticalStatus) {
          explosiveInjuryStatus = true;
          optimal = EXPLOSIVE_INJURY;
          optimalKey = EXPLOSIVE_INJURY;
        } else {
          if (this.condition.criticalCount === entriesMap[CRITICAL]) {
            explosiveInjuryStatus = true;
            criticalStatus = true;
            optimal = EXPLOSIVE_INJURY;
            optimalKey = EXPLOSIVE_INJURY;
          }
        }
      }

      entriesMap[optimal] = (entriesMap[optimal] || 0) + 1;

      if (explosiveInjuryStatus) {
        log += `<br>-----------------------------------------------------------------------------------<br>`;
        log += `词条分配：攻击力：${entriesMap[ATTACK_PERCENTAGE]}个，暴击：${entriesMap[CRITICAL]}个，`;
        log += `爆伤：${entriesMap[EXPLOSIVE_INJURY]}个，增伤：${entriesMap[INCREASED_DAMAGE]}个 `;
        log += `差距：${mainArticleDamageMap[CRITICAL][entriesMap[CRITICAL + "--"]].PercentageDifference.toFixed(6)} `;
        log += `总伤：${mainArticleDamageMap[CRITICAL][entriesMap[CRITICAL + "--"]].Damage.toFixed(6)}<br>`;
      } else {
        log += `<br>----------------------------------------------------------------------------------<br>`;
        log += `词条分配：攻击力：${entriesMap[ATTACK_PERCENTAGE]}个，暴击：${entriesMap[CRITICAL]}个，`;
        log += `爆伤：${entriesMap[EXPLOSIVE_INJURY]}个，增伤：${entriesMap[INCREASED_DAMAGE]}个 `;
        log += `差距：${mainArticleDamageMap[optimal][entriesMap[optimal]].PercentageDifference.toFixed(6)} `;
        log += `总伤：${mainArticleDamageMap[optimal][entriesMap[optimal]].Damage.toFixed(6)}<br>`;
      }
    }

    // 更新最终面板
    this.currentPanel.reductionResistance = this.basic.basicReductionResistance + this.gain.reductionResistance;
    this.currentPanel.vulnerable = this.basic.basicVulnerable + this.gain.vulnerable;
    this.currentPanel.specialDamage = this.basic.basicSpecialDamage + this.gain.specialDamage;
    
    this.handleBasicAttack(ATTACK_PERCENTAGE, entriesMap[ATTACK_PERCENTAGE] || 0);
    this.handleBasicCritical(CRITICAL, entriesMap[CRITICAL] || 0);
    this.handleBasicExplosiveInjury(EXPLOSIVE_INJURY, entriesMap[EXPLOSIVE_INJURY] || 0);
    this.handleBasicIncreasedDamage(INCREASED_DAMAGE, entriesMap[INCREASED_DAMAGE] || 0);

    for (let mag of this.magnifications) {
      this.increasedDamageArea(mag);
      this.reductionResistanceArea(mag);
    }
    
    this.vulnerableArea();
    this.specialDamageArea();

    log += `<br>最终面板：<br>`;
    log += `  攻击力: ${this.currentPanel.attack.toFixed(2)}, 暴击: ${this.currentPanel.critical.toFixed(2)}%, `;
    log += `爆伤: ${this.currentPanel.explosiveInjury.toFixed(2)}%, 增伤: ${((this.output.increasedDamageArea - 1) * 100).toFixed(2)}%<br>`;
    log += `  抗性区: ${((this.output.reductionResistanceArea - 1) * 100).toFixed(2)}%, `;
    log += `易伤区: ${((this.output.vulnerableArea - 1) * 100).toFixed(2)}%, `;
    log += `特殊乘区: ${((this.output.specialDamageArea - 1) * 100).toFixed(2)}%<br>`;

    return log;
  }
} 