import React, { useState, useEffect } from 'react';
import { Card, Table, Pagination, PaginationItem, PaginationLink, Input, Button, Form, FormGroup, Label } from 'reactstrap';
import axios from 'axios';
import Autocomplete from 'react-autocomplete';
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
  const [names, setNames] = useState([]);
  const [models, setModels] = useState([]);

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

  const fetchNames = async (input) => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/names", {
        params: {
          query: input
        }
      });
      setNames(response.data.names);
    } catch (error) {
      console.error("Error fetching names:", error);
    }
  };

  const fetchModels = async (input) => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/models", {
        params: {
          query: input
        }
      });
      setModels(response.data.models);
    } catch (error) {
      console.error("Error fetching models:", error);
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

  const handleFilterChange = (value, filterSetter) => {
    filterSetter(value);
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

  const isFilterApplied = firstNameFilter || dateFilter || modelFilter || departmentFilter;

  return (
    <div className="report-container">
      <Card className="custom-card">
        <Form inline className="filter-form">
          <FormGroup>
            <Label for="firstNameFilter" className="mr-sm-2">First Name</Label>
            <Autocomplete
              getItemValue={(item) => item}
              items={names}
              renderItem={(item, isHighlighted) =>
                <div key={item} style={{ background: isHighlighted ? 'lightgray' : 'white' }}>
                  {item}
                </div>
              }
              value={firstNameFilter}
              onChange={(e) => {
                handleFilterChange(e.target.value, setFirstNameFilter);
                fetchNames(e.target.value);
              }}
              onSelect={(value) => handleFilterChange(value, setFirstNameFilter)}
            />
          </FormGroup>
          <FormGroup>
            <Label for="modelFilter" className="mr-sm-2">Model</Label>
            <Autocomplete
              getItemValue={(item) => item}
              items={models}
              renderItem={(item, isHighlighted) =>
                <div key={item} style={{ background: isHighlighted ? 'lightgray' : 'white' }}>
                  {item}
                </div>
              }
              value={modelFilter}
              onChange={(e) => {
                handleFilterChange(e.target.value, setModelFilter);
                fetchModels(e.target.value);
              }}
              onSelect={(value) => handleFilterChange(value, setModelFilter)}
            />
          </FormGroup>
          <FormGroup>
            <Label for="dateFilter" className="mr-sm-2">Date</Label>
            <Input
              type="date"
              id="dateFilter"
              value={dateFilter}
              onChange={(e) => handleFilterChange(e.target.value, setDateFilter)}
              placeholder="Filter by date"
            />
          </FormGroup>
          <FormGroup>
            <Label for="departmentFilter" className="mr-sm-2">Department</Label>
            <Input
              type="select"
              id="departmentFilter"
              value={departmentFilter}
              onChange={(e) => handleFilterChange(e.target.value, setDepartmentFilter)}
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
        {isFilterApplied && summary && (
          <div className="summary-container">
            <div className="summary-item">
              <span>Total Tokens Used</span>
              <p>{summary.total_tokens_used}</p>
            </div>
            <div className="summary-item">
              <span>Total Prompt Tokens</span>
              <p>{summary.total_prompt_tokens}</p>
            </div>
            <div className="summary-item">
              <span>Total Completion Tokens</span>
              <p>{summary.total_completion_tokens}</p>
            </div>
            <div className="summary-item">
              <span>Total Price</span>
              <p>{summary.total_price}</p>
            </div>
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
                  <th>Total Price</th>
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
                    <td>{user.TotalCost}</td>
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
