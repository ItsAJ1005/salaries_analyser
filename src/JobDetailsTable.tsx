import React from 'react';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface JobDetail {
  title: string;
  count: number;
}

interface JobDetailsTableProps {
  data: JobDetail[];
}

const JobDetailsTable: React.FC<JobDetailsTableProps> = ({ data }) => {
  const columns: ColumnsType<JobDetail> = [
    {
      title: 'Job Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Number of Jobs',
      dataIndex: 'count',
      key: 'count',
    },
  ];

  return <Table dataSource={data} columns={columns} rowKey={(record) => record.title} />;
};

export default JobDetailsTable;
