import React, { useState, useEffect } from 'react';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import Papa from 'papaparse';
import JobTrendLineGraph from './JobTrendLineGraph.tsx';
import JobDetailsTable from './JobDetailsTable.tsx';

interface DataType {
  year: number;
  totalJobs: number;
  averageSalary: number;
}

interface JobDetail {
  title: string;
  count: number;
}

const MainTable: React.FC = () => {
  const [dataSource, setDataSource] = useState<DataType[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [jobDetails, setJobDetails] = useState<JobDetail[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('/salaries.csv');
      const reader = response.body?.getReader();
      const result = await reader?.read();
      const decoder = new TextDecoder('utf-8');
      const csvData = decoder.decode(result?.value);

      Papa.parse(csvData, {
        header: true,
        dynamicTyping: true,
        complete: function (results) {
          const data = results.data as any[];
          
          // Filter out invalid rows
          const validData = data.filter((item) => item.work_year && item.salary_in_usd);

          const aggregatedData = validData.reduce((acc: Record<string, { totalJobs: number, totalSalary: number }>, item) => {
            if (!acc[item.work_year]) {
              acc[item.work_year] = { totalJobs: 0, totalSalary: 0 };
            }
            acc[item.work_year].totalJobs += 1;
            acc[item.work_year].totalSalary += item.salary_in_usd;
            return acc;
          }, {});

          const formattedData = Object.entries(aggregatedData).map(([year, { totalJobs, totalSalary }]) => ({
            year: parseInt(year),
            totalJobs,
            averageSalary: totalSalary / totalJobs,
          }));

          setDataSource(formattedData);
        },
      });
    };

    fetchData();
  }, []);

  const columns: ColumnsType<DataType> = [
    {
      title: 'Year',
      dataIndex: 'year',
      key: 'year',
      sorter: (a, b) => a.year - b.year,
    },
    {
      title: 'Number of Total Jobs',
      dataIndex: 'totalJobs',
      key: 'totalJobs',
      sorter: (a, b) => a.totalJobs - b.totalJobs,
    },
    {
      title: 'Average Salary (USD)',
      dataIndex: 'averageSalary',
      key: 'averageSalary',
      sorter: (a, b) => a.averageSalary - b.averageSalary,
    },
  ];

  const handleRowClick = (record: DataType) => {
    setSelectedYear(record.year);
    fetchJobDetails(record.year);
  };

  const fetchJobDetails = async (year: number) => {
    const response = await fetch('/salaries.csv');
    const reader = response.body?.getReader();
    const result = await reader?.read();
    const decoder = new TextDecoder('utf-8');
    const csvData = decoder.decode(result?.value);

    Papa.parse(csvData, {
      header: true,
      dynamicTyping: true,
      complete: function (results) {
        const data = results.data as any[];
        const filteredData = data.filter((item) => item.work_year === year);
        const aggregatedData = filteredData.reduce((acc: Record<string, number>, item) => {
          if (!acc[item.job_title]) {
            acc[item.job_title] = 0;
          }
          acc[item.job_title] += 1;
          return acc;
        }, {});

        const jobDetailsData = Object.entries(aggregatedData).map(([title, count]) => ({
          title,
          count,
        }));

        setJobDetails(jobDetailsData);
      },
    });
  };

  return (
    <div>
      <Table
        dataSource={dataSource}
        columns={columns}
        rowKey={(record) => record.year.toString()}
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
        })}
      />
      <h2>Job Trend Line Graph</h2>
      <JobTrendLineGraph data={dataSource} />
      {selectedYear && (
        <>
          <h2>Job Details for {selectedYear}</h2>
          <JobDetailsTable data={jobDetails} />
        </>
      )}
    </div>
  );
};

export default MainTable;
