import React, { useState, useEffect } from 'react';
import { Card, Table, Pagination, PaginationItem, PaginationLink, Input, Button, Form, FormGroup, Label } from 'reactstrap';
import axios from 'axios';

const Report = () => {
  const [tokens, setTokens] = useState([]);
  const [page, setPage] = useState(1);
  const [perPage] = useState(15); // Number of items per page
  const [totalRecords, setTotalRecords] = useState(0);
  const [emailFilter, setEmailFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [lastVisitedPage, setLastVisitedPage] = useState(1);

  const fetchTokens = async (pageNumber, email, date) => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/token_usage", {
        params: {
          page: pageNumber,
          per_page: perPage,
          email: email || undefined,
          date: date || undefined
        }
      });
      setTokens(response.data.data);
      setTotalRecords(response.data.total_records);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchTokens(page, emailFilter, dateFilter);
  }, [page, emailFilter, dateFilter]);

  const handlePageChange = (pageNumber) => {
    setPage(pageNumber);
  };

  const handleFilterSubmit = (event) => {
    event.preventDefault();
    setLastVisitedPage(page); // Save the current page before applying filters
    setPage(1); // Reset to the first page on filter change
    fetchTokens(1, emailFilter, dateFilter);
  };

  const handleFilterClear = () => {
    setEmailFilter('');
    setDateFilter('');
    setPage(lastVisitedPage); // Revert to the last visited page before filters were applied
    fetchTokens(lastVisitedPage, '', '');
  };

  const totalPages = Math.ceil(totalRecords / perPage);

  return (
    <div>
      <Card className="custom-card" style={{ maxHeight: "450px", overflow: "auto" }}>
        <Form inline onSubmit={handleFilterSubmit} style={{ padding: "10px" }}>
          <FormGroup>
            <Label for="emailFilter" className="mr-sm-2">Email</Label>
            <Input
              type="email"
              id="emailFilter"
              value={emailFilter}
              onChange={(e) => setEmailFilter(e.target.value)}
              placeholder="Filter by email"
            />
          </FormGroup>
          <FormGroup>
            <Label for="dateFilter" className="mr-sm-2">Date</Label>
            <Input
              type="date"
              id="dateFilter"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              placeholder="Filter by date"
            />
          </FormGroup>
          <Button type="submit" color="primary" className="mr-2">Filter</Button>
          <Button type="button" color="secondary" onClick={handleFilterClear}>Clear Filters</Button>
        </Form>
        <Table hover>
          <thead>
            <tr>
              <th>Email</th>
              <th>Usage Timestamp</th>
              <th>Tokens Used</th>
              <th>Prompt Tokens</th>
              <th>Completion Tokens</th>
              <th>Successful Requests</th>
            </tr>
          </thead>
          <tbody>
            {tokens.map((user, index) => (
              <tr key={index}>
                <td>{user.Email}</td>
                <td>{new Date(user.UsageTimestamp).toLocaleString()}</td>
                <td>{user.TokensUsed}</td>
                <td>{user.PromptTokens}</td>
                <td>{user.CompletionTokens}</td>
                <td>{user.SuccessfulRequests}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
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
  );
};

export default Report;
