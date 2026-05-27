import React, { useState, useEffect } from "react";

import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Upload,
  message,
  Popconfirm,
} from "antd";

import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";

import type { UploadFile, UploadProps } from "antd";

import { useDispatch, useSelector } from "react-redux";

import {
  fetchItems,
  addItem,
  updateItem,
  deleteItem,
  type Item,
} from "./itemsSlice";

import type { RootState, AppDispatch } from "../../store";



const getColumns = (
  onEdit: (item: Item) => void,
  onDelete: (id: number) => void
) => [
  {
    title: "ID",
    dataIndex: "id",
    key: "id",
  },

  {
    title: "Title",
    dataIndex: "title",
    key: "title",
  },

  {
    title: "Description",
    dataIndex: "description",
    key: "description",
  },

  {
    title: "Files",
    dataIndex: "files",
    key: "files",
  },

  {
    title: "Images",
    dataIndex: "images",
    key: "images",
  },

  {
    title: "Actions",

    key: "actions",

    render: ( record: Item) => (
      <Space>

        <Button
          icon={<EditOutlined />}
          type="link"
          onClick={() => onEdit(record)}
        />

        <Popconfirm
          title="Delete item?"
          onConfirm={() => onDelete(record.id)}
        >
          <Button
            icon={<DeleteOutlined />}
            type="link"
            danger
          />
        </Popconfirm>

      </Space>
    ),
  },
];



const IteamsScreen: React.FC = () => {

  const dispatch = useDispatch<AppDispatch>();

  const {
    items,
    fetchLoading,
    addLoading,
    updateLoading,
  } = useSelector(
    (state: RootState) => state.items
  );



  const [form] = Form.useForm();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isEdit, setIsEdit] = useState(false);

  const [editingItem, setEditingItem] =
    useState<Item | null>(null);

  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const [imageList, setImageList] =
    useState<UploadFile[]>([]);



  useEffect(() => {

    dispatch(fetchItems());

  }, [dispatch]);



  // ---------------- OPEN ADD MODAL ----------------

  const showModal = () => {

    setIsEdit(false);

    setEditingItem(null);

    form.resetFields();

    setFileList([]);

    setImageList([]);

    setIsModalOpen(true);
  };



  // ---------------- OPEN EDIT MODAL ----------------

  const handleEdit = (item: Item) => {

    setIsEdit(true);

    setEditingItem(item);

    setIsModalOpen(true);



    // IMPORTANT
    // set values AFTER modal opens

    setTimeout(() => {

      form.setFieldsValue({

        title: item.title,

        description: item.description,
      });



      // CLEAR OLD ERRORS

      form.setFields([
        {
          name: "title",
          errors: [],
        },

        {
          name: "description",
          errors: [],
        },
      ]);



      // FILES

      setFileList(
        item.files
          ? [
              {
                uid: "-1",
                name: item.files,
                status: "done",
              },
            ]
          : []
      );



      // IMAGES

      setImageList(
        item.images
          ? [
              {
                uid: "-2",
                name: item.images,
                status: "done",
              },
            ]
          : []
      );

    }, 100);
  };



  // ---------------- DELETE ----------------

  const handleDelete = (id: number) => {

    dispatch(deleteItem(id));
  };



  // ---------------- CANCEL MODAL ----------------

  const handleCancel = () => {

    setIsModalOpen(false);

    setIsEdit(false);

    setEditingItem(null);

    form.resetFields();

    setFileList([]);

    setImageList([]);
  };



  // ---------------- FILE CHANGES ----------------

  const handleFileChange: UploadProps["onChange"] = (
    info
  ) => {

    setFileList(info.fileList);
  };



  const handleImageChange: UploadProps["onChange"] = (
    info
  ) => {

    setImageList(info.fileList);
  };



  // ---------------- SUBMIT ----------------

  const handleOk = async () => {

    try {

      const values = await form.validateFields();



      // CLEAR ERRORS MANUALLY

      form.setFields([
        {
          name: "title",
          errors: [],
        },

        {
          name: "description",
          errors: [],
        },
      ]);



      const fileObj =
        fileList.length > 0 &&
        fileList[0].originFileObj instanceof File
          ? fileList[0].originFileObj
          : undefined;



      const imageObj =
        imageList.length > 0 &&
        imageList[0].originFileObj instanceof File
          ? imageList[0].originFileObj
          : undefined;



      // ---------- UPDATE ----------

      if (isEdit && editingItem) {

        await dispatch(

          updateItem({

            id: editingItem.id,

            data: {

              title: values.title,

              description: values.description,

              owner_id: editingItem.owner_id,

              files: fileObj,

              images: imageObj,
            },
          })

        );



        message.success("Item updated successfully!");
      }

      // ---------- ADD ----------

      else {

        await dispatch(

          addItem({

            title: values.title,

            description: values.description,

            owner_id: 1,

            files: fileObj,

            images: imageObj,
          })

        );



        message.success("Item added successfully!");
      }



      // RESET EVERYTHING

      form.resetFields();

      setFileList([]);

      setImageList([]);

      setEditingItem(null);

      setIsEdit(false);

      setIsModalOpen(false);

    }

    catch (err) {

      console.log(err);
    }
  };



  return (

    <div className="p-4">

      <Table
        columns={getColumns(
          handleEdit,
          handleDelete
        )}
        dataSource={items}
        rowKey="id"
        loading={fetchLoading}
        pagination={false}
      />



      <div className="flex justify-between mt-4">

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={showModal}
        >
          Add Item
        </Button>

      </div>



      <Modal
        title={isEdit ? "Edit Item" : "Add Item"}
        open={isModalOpen}
        onCancel={handleCancel}
        onOk={handleOk}
        okText={isEdit ? "Update" : "Add"}
        confirmLoading={
          addLoading || updateLoading
        }
        destroyOnClose
      >

        <Form
          form={form}
          layout="vertical"
        >

          <Form.Item
            name="title"
            label="Title"
            validateTrigger={["onChange", "onBlur"]}
            rules={[
              {
                required: true,
                message: "Please enter title",
              },
            ]}
          >

            <Input placeholder="Enter item title" />

          </Form.Item>



          <Form.Item
            name="description"
            label="Description"
            validateTrigger={["onChange", "onBlur"]}
            rules={[
              {
                required: true,
                message:
                  "Please enter description",
              },
            ]}
          >

            <Input placeholder="Enter item description" />

          </Form.Item>



          <Form.Item
            name="files"
            label="Files"
          >

            <Upload
              beforeUpload={() => false}
              fileList={fileList}
              onChange={handleFileChange}
              maxCount={1}
            >

              <Button
                icon={<UploadOutlined />}
              >
                Select Files
              </Button>

            </Upload>

          </Form.Item>



          <Form.Item
            name="images"
            label="Images"
          >

            <Upload
              beforeUpload={() => false}
              fileList={imageList}
              onChange={handleImageChange}
              listType="picture"
              maxCount={1}
            >

              <Button
                icon={<UploadOutlined />}
              >
                Select Images
              </Button>

            </Upload>

          </Form.Item>

        </Form>

      </Modal>

    </div>
  );
};



export default IteamsScreen;