import React, { useReducer } from "react";
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
  Menu,
  Dropdown,
  Space,
  Modal,
  Progress,
} from "antd";
import { DownOutlined } from "@ant-design/icons";
import { ColumnsType } from "antd/lib/table";
import { useImmer } from "use-immer";
import { AppState, messageReducer, UpdateSubProcess } from "./reducers/message";
import { useEffect } from "react";
import { MessageType, SubMessage } from "./constants";
import EllipsisMiddle from "./components/EllipsisMiddle";

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
// const rowSelection = {
//   onChange: (selectedRowKeys: React.Key[], selectedRows: DataType[]) => {
//     console.log(
//       `selectedRowKeys: ${selectedRowKeys}`,
//       "selectedRows: ",
//       selectedRows,
//     );
//   },
//   getCheckboxProps: (record: DataType) => ({
//     disabled: record.name === "Disabled User", // Column configuration not to be checked
//     name: record.name,
//   }),
// };

function App() {
  const [selectedRowKeys, setSelectedRowKeys] = useImmer<string[]>([]);
  const [form] = Form.useForm();

  const initialState: AppState = {
    learningSub: [],
    nativeSub: [],
    isIndexingSub: false,
    indexSubProcess: 0,
  };

  const [state, dispatch] = useReducer(messageReducer, initialState);

  useEffect(() => {
    iina.onMessage(MessageType.UpdateSub, (message: SubMessage) => {
      dispatch({ type: "updateSub", payload: message });
    });
    iina.onMessage(
      MessageType.UpdateSubProcess,
      (process: UpdateSubProcess) => {
        dispatch({ type: "updateSubProcess", process });
      },
    );
  }, []);

  // Actions
  const selectRow = (record: DataType) => {
    const newSelectedRowKeys = [...selectedRowKeys];
    if (newSelectedRowKeys.includes(record.key)) {
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
  const onClick = async (data) => {
    console.log(data);
    console.log("click");

    iina.onMessage("updateUI", (message) => {
      console.log("updateUI");
      console.log(message);
    });
    // iina.postMessage("loadingSubAction");
  };

  const selectSubEvent = async (data, subType) => {
    console.log(data);
    console.log(subType);

    console.log("selectSub");

    iina.postMessage(MessageType.SelectSubAction, { subType: data });
  };

  const stopIndexSubEvent = () => {
    dispatch({ type: "stopIndexSub" });
  };

  const indexingSubClick = async (data) => {
    iina.postMessage(MessageType.IndexSubAction, { duration: data.key });
  };

  const menu = (
    <Menu
      onClick={indexingSubClick}
      items={[
        {
          key: 0,
          label: "All",
        },
        {
          key: 300,
          label: "5 min",
        },
        {
          key: 600,
          label: "10 min",
        },
      ]}
    />
  );

  return (
    <div className="App" style={{ padding: "24px" }}>
      <Row gutter={16} justify="center">
        <Col xs={24} md={16}>
          <Card
            // title="Control"
            headStyle={{ textAlign: "center" }}
            hoverable
            bodyStyle={{ paddingTop: "0px" }}
          >
            {/* <Divider orientation="center">Learning subtitle</Divider> */}
            <div style={{ paddingTop: "24px" }}>
              <Button type="primary" onClick={onClick}>
                Start Learn
              </Button>
              <Dropdown overlay={menu}>
                <Button style={{ marginLeft: "8px" }}>
                  <Space>
                    Index Subtitle
                    <DownOutlined />
                  </Space>
                </Button>
              </Dropdown>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={16}>
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
        <Col xs={24} md={16}>
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
                <Select
                  placeholder="Only support External Subtitle"
                  onChange={(value) => {
                    selectSubEvent(value, "learningSub");
                  }}
                >
                  {state.learningSub.map((sub, index) => {
                    return (
                      <Select.Option key={index} value={sub.id}>
                        <EllipsisMiddle suffixCount={20}>
                          {`#${sub.id} ${sub.title}`}
                        </EllipsisMiddle>
                      </Select.Option>
                    );
                  })}
                </Select>
              </Form.Item>
              <Form.Item
                style={{ marginBottom: "8px" }}
                label="Native & Learning subtitle"
              >
                <Select
                  placeholder="Please select"
                  onChange={(value) => {
                    selectSubEvent(value, "nativeSub");
                  }}
                >
                  {state.nativeSub.map((sub, index) => {
                    return (
                      <Select.Option key={index} value={sub.id}>
                        <EllipsisMiddle suffixCount={20}>
                          {`#${sub.id} ${sub.title}`}
                        </EllipsisMiddle>
                      </Select.Option>
                    );
                  })}
                </Select>
              </Form.Item>
              <Form.Item>
                <Checkbox>Bilingual subtitles?</Checkbox>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>

      <Modal
        title={
          <div
            style={{
              textAlign: "center",
            }}
          >
            Indexing Subtitle
          </div>
        }
        onCancel={stopIndexSubEvent}
        centered={true}
        closable={false}
        maskClosable={false}
        keyboard={false}
        open={state.isIndexingSub}
        width={300}
        footer={[
          <Button key="stop" danger onClick={stopIndexSubEvent}>
            Stop
          </Button>,
        ]}
      >
        <div style={{ textAlign: "center" }}>
          <Progress percent={state.indexSubProcess} />
        </div>
      </Modal>
    </div>
  );
}

export default App;
