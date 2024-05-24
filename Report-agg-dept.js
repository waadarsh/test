import React, { useState, useEffect } from 'react';
import { Card, Table, Pagination, PaginationItem, PaginationLink, Input, Button, Form, FormGroup, Label } from 'reactstrap';
import axios from 'axios';
import './Report.css'; // Make sure to import the CSS file

const Report = () => {
  const [tokens, setTokens] = useState([]);
  const [page, setPage] = useState(1);
  const [perPage] = useState(15); // Number of items per page
  const [totalRecords, setTotalRecords] = useState(0);
  const [firstNameFilter, setFirstNameFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [modelFilter, setModelFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [lastVisitedPage, setLastVisitedPage] = useState(1);
  const [summary, setSummary] = useState(null);
  const [departments, setDepartments] = useState([]);

  const fetchTokens = async (pageNumber, firstName, date, model, department) => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/token_usage", {
        params: {
          page: pageNumber,
          per_page: perPage,
          first_name: firstName || undefined,
          date: date || undefined,
          model: model || undefined,
          department: department || undefined
        }
      });
      setTokens(response.data.data);
      setTotalRecords(response.data.total_records);
      setSummary(response.data.summary);
      setDepartments(response.data.departments);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchTokens(page, firstNameFilter, dateFilter, modelFilter, departmentFilter);
    const interval = setInterval(() => {
      fetchTokens(page, firstNameFilter, dateFilter, modelFilter, departmentFilter);
    }, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, firstNameFilter, dateFilter, modelFilter, departmentFilter]);

  const handlePageChange = (pageNumber) => {
    setPage(pageNumber);
    setLastVisitedPage(pageNumber);
  };

  const handleFilterChange = (event, filterSetter) => {
    filterSetter(event.target.value);
    setPage(1); // Reset to the first page on filter change
  };

  const handleFilterClear = () => {
    setFirstNameFilter('');
    setDateFilter('');
    setModelFilter('');
    setDepartmentFilter('');
    setPage(lastVisitedPage); // Revert to the last visited page before filters were applied
  };

  const totalPages = Math.ceil(totalRecords / perPage);

  return (
    <div className="report-container">
      <Card className="custom-card">
        <Form inline className="filter-form">
          <FormGroup>
            <Label for="firstNameFilter" className="mr-sm-2">First Name</Label>
            <Input
              type="text"
              id="firstNameFilter"
              value={firstNameFilter}
              onChange={(e) => handleFilterChange(e, setFirstNameFilter)}
              placeholder="Filter by first name"
            />
          </FormGroup>
          <FormGroup>
            <Label for="modelFilter" className="mr-sm-2">Model</Label>
            <Input
              type="text"
              id="modelFilter"
              value={modelFilter}
              onChange={(e) => handleFilterChange(e, setModelFilter)}
              placeholder="Filter by model"
            />
          </FormGroup>
          <FormGroup>
            <Label for="dateFilter" className="mr-sm-2">Date</Label>
            <Input
              type="date"
              id="dateFilter"
              value={dateFilter}
              onChange={(e) => handleFilterChange(e, setDateFilter)}
              placeholder="Filter by date"
            />
          </FormGroup>
          <FormGroup>
            <Label for="departmentFilter" className="mr-sm-2">Department</Label>
            <Input
              type="select"
              id="departmentFilter"
              value={departmentFilter}
              onChange={(e) => handleFilterChange(e, setDepartmentFilter)}
            >
              <option value="">All Departments</option>
              {departments.map((department, index) => (
                <option key={index} value={department}>
                  {department}
                </option>
              ))}
            </Input>
          </FormGroup>
          <Button type="button" color="secondary" onClick={handleFilterClear}>Clear Filters</Button>
        </Form>
        {summary && (
          <div className="summary-container">
            <p>Total Tokens Used: {summary.total_tokens_used}</p>
            <p>Total Prompt Tokens: {summary.total_prompt_tokens}</p>
            <p>Total Completion Tokens: {summary.total_completion_tokens}</p>
            <p>Total Successful Requests: {summary.total_successful_requests}</p>
          </div>
        )}
        {tokens.length > 0 ? (
          <div className="table-container">
            <Table hover>
              <thead>
                <tr>
                  <th>First Name</th>
                  <th>Usage Timestamp</th>
                  <th>Tokens Used</th>
                  <th>Prompt Tokens</th>
                  <th>Completion Tokens</th>
                  <th>Successful Requests</th>
                  <th>Model</th>
                  <th>Department</th>
                </tr>
              </thead>
              <tbody>
                {tokens.map((user, index) => (
                  <tr key={index}>
                    <td>{user.FirstName}</td>
                    <td>{new Date(user.UsageTimestamp).toLocaleString()}</td>
                    <td>{user.TokensUsed}</td>
                    <td>{user.PromptTokens}</td>
                    <td>{user.CompletionTokens}</td>
                    <td>{user.SuccessfulRequests}</td>
                    <td>{user.ModelName}</td>
                    <td>{user.Department}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        ) : (
          <div className="no-data">No data available for the applied filters.</div>
        )}
      </Card>
      <div className="pagination-container">
        <Pagination aria-label="Page navigation example">
          <PaginationItem disabled={page <= 1}>
            <PaginationLink previous onClick={() => handlePageChange(page - 1)} />
          </PaginationItem>
          {[...Array(totalPages).keys()].map((pageNumber) => (
            <PaginationItem active={pageNumber + 1 === page} key={pageNumber}>
              <PaginationLink onClick={() => handlePageChange(pageNumber + 1)}>
                {pageNumber + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem disabled={page >= totalPages}>
            <PaginationLink next onClick={() => handlePageChange(page + 1)} />
          </PaginationItem>
        </Pagination>
      </div>
    </div>
  );
};

export default Report;
