import { useState } from "react";
import "./App.css";
import {
  Form,
  Input,
  InputNumber,
  Button,
  Card,
  Typography,
  Row,
  Col,
  message,
} from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Basic,
  Gain,
  Defense,
  Condition,
  Magnification,
  Initialization,
  ATTACK_PERCENTAGE,
  CRITICAL,
  EXPLOSIVE_INJURY,
  INCREASED_DAMAGE,
} from "./calculator";
import { DecimalToPercentage } from "./utils";

const { Title } = Typography;

function App() {
  const [logMessages, setLogMessages] = useState("");
  const [form] = Form.useForm();
  const sights = Form.useWatch("sights", form);

  const handleFinish = (values: any) => {
    let logs = "";

    // 构造 Basic 参数
    const basic = new Basic(
      values.basicAttack || 0,
      values.basicCritical || 0,
      values.basicExplosiveInjury || 0,
      values.basicIncreasedDamage || 0,
      values.basicReductionResistance || 0,
      values.basicVulnerable || 0,
      values.basicSpecialDamage || 0
    );

    // 构造 Gain 参数
    const gain = new Gain(
      values.attackValue || 0,
      values.attackPowerPercentage || 0,
      values.attackInternalPercentage || 0,
      values.gainCritical || 0,
      values.gainExplosiveInjury || 0,
      values.gainIncreasedDamage || 0,
      values.gainReductionResistance || 0,
      values.gainVulnerable || 0,
      values.gainSpecialDamage || 0
    );

    // 构造 Defense 参数
    const defense = new Defense(
      values.penetration || 0,
      values.defenseBreak || 0,
      values.penetrationValue || 0
    );

    // 构造 Condition 参数（修正字段名）
    const condition = new Condition(
      values.mainArticle || 0,
      values.conditionCritical || 0 // 原 name 应为 conditionCritical
    );

    // 处理倍率数组
    const magnifications = (values.sights || []).map(
      (sight: any) =>
        new Magnification(
          sight.magValue || 0,
          sight.magTrigger || 0, // 注意：这里使用magTrigger映射到Magnification的triggerTimes参数
          sight.magName || "",
          sight.magIncreasedDamage || 0,
          sight.magReductionResistance || 0,
          sight.magDefenseBreak || 0,
          sight.magPenetration || 0,
          sight.magSpecialDamage || 0
        )
    );

    // 初始化计算对象
    const init = new Initialization(
      basic,
      gain,
      defense,
      condition,
      magnifications
    );

    // 构造词条类型 Map
    const mainArticleDamageMap: Record<string, any[]> = {
      [ATTACK_PERCENTAGE]: [],
      [CRITICAL]: [],
      [EXPLOSIVE_INJURY]: [],
      [INCREASED_DAMAGE]: [],
    };

    // 初始化词条分配数量
    const MainArticleMap: Record<string, number> = {
      [ATTACK_PERCENTAGE]: 0,
      [CRITICAL]: 0,
      [EXPLOSIVE_INJURY]: 0,
      [INCREASED_DAMAGE]: 0,
    };

    // 遍历每个词条类型进行计算
    for (const key of [
      ATTACK_PERCENTAGE,
      CRITICAL,
      EXPLOSIVE_INJURY,
      INCREASED_DAMAGE,
    ]) {
      let attributeName = "";
      switch (key) {
        case ATTACK_PERCENTAGE:
          attributeName = "攻击力";
          break;
        case CRITICAL:
          attributeName = "暴击率";
          break;
        case EXPLOSIVE_INJURY:
          attributeName = "爆伤";
          break;
        case INCREASED_DAMAGE:
          attributeName = "增伤";
          break;
      }

      logs += `<br>正在计算属性：${attributeName}<br>`;
      logs += `------------------------------------------------------------------------------------------<br>`;

      // 初始面板
      init.characterPanel("", 0);
      let OldDamage = init.calculatingTotalDamage();
      MainArticleMap[key] = 1;

      while (MainArticleMap[key] <= condition.mainArticle) {
        init.characterPanel(key, MainArticleMap[key]);

        // 记录当前面板
        logs += `当前词条分配数：${
          MainArticleMap[key]
        }，攻击力：${init.currentPanel.attack.toFixed(2)}，`;
        logs += `暴击率：${init.currentPanel.critical.toFixed(
          2
        )}%，爆伤：${init.currentPanel.explosiveInjury.toFixed(2)}%，`;
        logs += `增伤：${init.currentPanel.increasedDamage.toFixed(2)}%<br>`;

        const NewDamage = init.calculatingTotalDamage();
        const percentageDifference = DecimalToPercentage(NewDamage, OldDamage);

        mainArticleDamageMap[key].push({
          CurrentPanel: { ...init.currentPanel },
          Output: { ...init.output },
          Damage: NewDamage,
          PercentageDifference: percentageDifference,
        });

        logs += `总伤害：${(NewDamage / 10000).toFixed(6)}万<br>`;
        logs += `伤害变化率：${percentageDifference.toFixed(2)}%<br>`;
        logs += `------------------------------------------------------<br>`;

        OldDamage = NewDamage;
        MainArticleMap[key]++;
      }
    }

    // 最终结果处理
    logs += init.getMaxFloat(mainArticleDamageMap);
    setLogMessages(logs);
  };

  const handleRemove = (
    fn: (index: number | number[]) => void,
    name: number
  ) => {
    if (sights?.length <= 1) {
      message.warning("只剩一个啦！不能再删啦");
      return;
    }
    fn?.(name);
  };

  return (
    <div className="App">
      <Title level={2}>伤害计算器</Title>
      <Form
        form={form}
        onFinish={handleFinish}
        layout="vertical"
        initialValues={{
          basicAttack: 1642,
          basicCritical: 43.4,
          basicExplosiveInjury: 98,
          basicIncreasedDamage: 15,
          basicReductionResistance: 0,
          basicVulnerable: 0,
          basicSpecialDamage: 0,
          attackValue: 1516,
          attackPowerPercentage: 30,
          attackInternalPercentage: 37,
          gainCritical: 25,
          gainExplosiveInjury: 75,
          gainIncreasedDamage: 44,
          gainReductionResistance: 0,
          gainVulnerable: 25,
          gainSpecialDamage: 0,
          penetration: 0,
          defenseBreak: 0,
          penetrationValue: 0,
          mainArticle: 44,
          conditionCritical: 95,
          sights: [
            {
              magName: "普攻",
              magValue: 943.5,
              magTrigger: 2,
              magIncreasedDamage: 0,
              magReductionResistance: 0,
              magDefenseBreak: 0,
              magPenetration: 0,
              magSpecialDamage: 0,
            },
            {
              magName: "连携技",
              magValue: 1658.7,
              magTrigger: 4.5,
              magIncreasedDamage: 30,
              magReductionResistance: 25,
              magDefenseBreak: 0,
              magPenetration: 0,
              magSpecialDamage: 25,
            },
            {
              magName: "强化特殊技",
              magValue: 1202.5,
              magTrigger: 2,
              magIncreasedDamage: 0,
              magReductionResistance: 0,
              magDefenseBreak: 0,
              magPenetration: 0,
              magSpecialDamage: 0,
            },
            {
              magName: "终结技",
              magValue: 3977.3,
              magTrigger: 1,
              magIncreasedDamage: 30,
              magReductionResistance: 25,
              magDefenseBreak: 0,
              magPenetration: 0,
              magSpecialDamage: 25,
            },
          ],
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Card title="Basic 参数">
              <Form.Item label="基础攻击力" name="basicAttack">
                <InputNumber min={1} max={100000} style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item label="基础暴击" name="basicCritical">
                <InputNumber min={0} max={10000} style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item label="基础爆伤" name="basicExplosiveInjury">
                <InputNumber min={0} max={10000} style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item label="基础增伤" name="basicIncreasedDamage">
                <InputNumber min={0} max={10000} style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item label="基础减抗" name="basicReductionResistance">
                <InputNumber min={0} max={10000} style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item label="基础易伤" name="basicVulnerable">
                <InputNumber min={0} max={10000} style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item label="基础特殊增伤" name="basicSpecialDamage">
                <InputNumber min={0} max={10000} style={{ width: "100%" }} />
              </Form.Item>
            </Card>
          </Col>

          <Col span={12}>
            <Card title="Gain 参数">
              <Form.Item label="攻击力增加" name="attackValue">
                <InputNumber min={0} max={10000} style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item label="攻击力百分比" name="attackPowerPercentage">
                <InputNumber min={0} max={10000} style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item
                label="局内攻击力百分比"
                name="attackInternalPercentage"
              >
                <InputNumber min={0} max={10000} style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item label="增暴" name="gainCritical">
                <InputNumber min={0} max={10000} style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item label="增爆伤" name="gainExplosiveInjury">
                <InputNumber min={0} max={10000} style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item label="增增伤" name="gainIncreasedDamage">
                <InputNumber min={0} max={10000} style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item label="增减抗" name="gainReductionResistance">
                <InputNumber min={0} max={10000} style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item label="增易伤" name="gainVulnerable">
                <InputNumber min={0} max={10000} style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item label="增特殊增伤" name="gainSpecialDamage">
                <InputNumber min={0} max={10000} style={{ width: "100%" }} />
              </Form.Item>
            </Card>
          </Col>
        </Row>

        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={12}>
            <Card title="Defense 参数">
              <Form.Item label="穿透率" name="penetration">
                <InputNumber min={0} max={10000} style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item label="破防百分比" name="defenseBreak">
                <InputNumber min={0} max={10000} style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item label="穿透值" name="penetrationValue">
                <InputNumber min={0} max={10000} style={{ width: "100%" }} />
              </Form.Item>
            </Card>
          </Col>

          <Col span={12}>
            <Card title="Condition 参数">
              <Form.Item label="有效主词条数" name="mainArticle">
                <InputNumber min={0} max={10000} style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item label="暴击阈值" name="conditionCritical">
                <InputNumber min={0} max={10000} style={{ width: "100%" }} />
              </Form.Item>
            </Card>
          </Col>
        </Row>

        <Card title="倍率参数" style={{ marginTop: 16 }}>
          <Form.List name="sights">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Card
                    key={key}
                    style={{ marginBottom: 16 }}
                    size="small"
                    title={
                      <Row justify="space-between" align="middle">
                        <Col>
                          <Form.Item
                            {...restField}
                            name={[name, "magName"]}
                            rules={[{ required: true, message: "请输入名称" }]}
                            style={{ marginBottom: 0 }}
                          >
                            <Input placeholder="名称" />
                          </Form.Item>
                        </Col>
                        <Col>
                          <MinusCircleOutlined
                            onClick={() => handleRemove(remove, name)}
                          />
                        </Col>
                      </Row>
                    }
                  >
                    <Row gutter={[16, 16]}>
                      <Col span={8}>
                        <Form.Item
                          {...restField}
                          label="倍率值"
                          name={[name, "magValue"]}
                          style={{ marginBottom: 0 }}
                        >
                          <InputNumber style={{ width: "100%" }} />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          {...restField}
                          label="触发次数"
                          name={[name, "magTrigger"]}
                          style={{ marginBottom: 0 }}
                        >
                          <InputNumber style={{ width: "100%" }} />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          {...restField}
                          label="增伤"
                          name={[name, "magIncreasedDamage"]}
                          style={{ marginBottom: 0 }}
                        >
                          <InputNumber style={{ width: "100%" }} />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          {...restField}
                          label="减抗"
                          name={[name, "magReductionResistance"]}
                          style={{ marginBottom: 0 }}
                        >
                          <InputNumber style={{ width: "100%" }} />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          {...restField}
                          label="破防"
                          name={[name, "magDefenseBreak"]}
                          style={{ marginBottom: 0 }}
                        >
                          <InputNumber style={{ width: "100%" }} />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          {...restField}
                          label="穿透"
                          name={[name, "magPenetration"]}
                          style={{ marginBottom: 0 }}
                        >
                          <InputNumber style={{ width: "100%" }} />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          {...restField}
                          label="特殊增伤"
                          name={[name, "magSpecialDamage"]}
                          style={{ marginBottom: 0 }}
                        >
                          <InputNumber style={{ width: "100%" }} />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    添加倍率
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Card>

        <Form.Item style={{ marginTop: 16 }}>
          <Button type="primary" htmlType="submit" size="large" block>
            一键运行
          </Button>
        </Form.Item>
      </Form>

      {logMessages && (
        <Card title="计算结果"  style={{ marginTop: 16 }}>
          <Typography.Text>
            <div dangerouslySetInnerHTML={{ __html: logMessages }} />
          </Typography.Text>
        </Card>
      )}
    </div>
  );
}

export default App;
