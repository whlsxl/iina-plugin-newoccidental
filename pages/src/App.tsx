import React, { useState } from "react";
// import 'antd/es/button/style/css';
// import 'antd/es/card/style/css';
import {
  Col,
  Row,
  Table,
  Card,
  Divider,
  Select,
  Form,
  Checkbox,
  Button,
  Dropdown,
  Menu,
} from "antd";
import { ColumnsType } from "antd/lib/table";
import { useImmer } from "use-immer";
// import { ColumnsType } from 'antd/lib/table';

interface DataType {
  key: string;
  name: string;
}

const columns: ColumnsType<DataType> = [
  {
    key: "name",
    title: "Process",
    dataIndex: "name",
  },
];

const data: DataType[] = [
  {
    key: "listen",
    name: "Listen",
  },
  {
    key: "learning",
    name: "Learning subtitle",
  },
  {
    key: "native",
    name: "Native & Learning subtitle",
  },
  {
    key: "again",
    name: "Listen Again",
  },
  {
    key: "read",
    name: "Follow read",
  },
];
const rowSelection = {
  onChange: (selectedRowKeys: React.Key[], selectedRows: DataType[]) => {
    console.log(
      `selectedRowKeys: ${selectedRowKeys}`,
      "selectedRows: ",
      selectedRows,
    );
  },
  getCheckboxProps: (record: DataType) => ({
    disabled: record.name === "Disabled User", // Column configuration not to be checked
    name: record.name,
  }),
};

function App() {
  const [selectedRowKeys, setSelectedRowKeys] = useImmer<string[]>([]);
  const [form] = Form.useForm();

  const selectRow = (record: DataType) => {
    const newSelectedRowKeys = [...selectedRowKeys];
    if (newSelectedRowKeys.indexOf(record.key) >= 0) {
      newSelectedRowKeys.splice(newSelectedRowKeys.indexOf(record.key), 1);
    } else {
      newSelectedRowKeys.push(record.key);
    }
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const onSelectedRowKeysChange = (selectedRowKeys: React.Key[]) => {
    const keys = selectedRowKeys as string[];
    setSelectedRowKeys(keys);
  };

  const menu = (
    <Menu
      // onClick={onMenuClick}
      items={[
        {
          key: "5min",
          label: "5 min",
        },
        {
          key: "10min",
          label: "10 min",
        },
      ]}
    />
  );
  return (
    <div className="App" style={{ padding: "24px" }}>
      <Row gutter={16} justify="center">
        <Col className="gutter-row" span={16}>
          <Card
            // title="Control"
            headStyle={{ textAlign: "center" }}
            hoverable
            bodyStyle={{ paddingTop: "0px" }}
          >
            {/* <Divider orientation="center">Learning subtitle</Divider> */}
            <div style={{ paddingTop: "24px" }}>
              <Button type="primary">Start Learn</Button>
              <Dropdown.Button style={{ marginLeft: "8px" }} overlay={menu}>
                Seek subtitle
              </Dropdown.Button>
            </div>
          </Card>
        </Col>
        <Col className="gutter-row" span={16}>
          <Card
            // title="Process"
            headStyle={{ textAlign: "center" }}
            hoverable
            bodyStyle={{ paddingTop: "0px" }}
            style={{ marginTop: "24px" }}
          >
            <Divider orientation="center">Process</Divider>
            <Table
              // style={{ border: '1px solid rgba(0,0,0,.06)' }}
              style={{ paddingTop: "1px" }}
              showHeader={false}
              pagination={false}
              columns={columns}
              onRow={(record) => ({
                onClick: () => {
                  selectRow(record);
                },
              })}
              rowSelection={{
                selectedRowKeys,
                onChange: onSelectedRowKeysChange,
              }}
              dataSource={data}
            />
          </Card>
        </Col>
        <Col className="gutter-row" span={16}>
          <Card
            // title={<di style={{ textAlign: "center" }}>Configuration</div>}
            hoverable
            style={{ marginTop: "24px" }}
            bodyStyle={{ paddingTop: "0px", paddingBottom: "0px" }}
          >
            <Divider orientation="center">Configuration</Divider>
            <Form form={form} layout="vertical" autoComplete="off">
              {/* <Divider plain orientation="left">
                Learning subtitle
              </Divider> */}
              <Form.Item label="Learning subtitle">
                <Select placeholder="Please select">
                  <Select.Option value="jack">Jack</Select.Option>
                  <Select.Option value="lucy">Lucy</Select.Option>
                  <Select.Option value="tom">Tom</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item
                style={{ marginBottom: "8px" }}
                label="Native & Learning subtitle"
              >
                <Select placeholder="Please select">
                  <Select.Option value="jack">Jack</Select.Option>
                  <Select.Option value="lucy">Lucy</Select.Option>
                  <Select.Option value="tom">Tom</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item>
                <Checkbox>Bilingual subtitles?</Checkbox>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default App;
