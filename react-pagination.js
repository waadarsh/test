import React, { useState, useEffect } from 'react';
import { Card, Table, Pagination, PaginationItem, PaginationLink } from 'reactstrap';
import axios from 'axios';

const Report = () => {
  const [tokens, setTokens] = useState([]);
  const [page, setPage] = useState(1);
  const [perPage] = useState(15); // Number of items per page
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchTokens = async (pageNumber) => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/token_usage", {
        params: { page: pageNumber, per_page: perPage }
      });
      setTokens(response.data.data);
      setTotalRecords(response.data.total_records);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchTokens(page);
  }, [page]);

  const totalPages = Math.ceil(totalRecords / perPage);

  const handlePageChange = (pageNumber) => {
    setPage(pageNumber);
  };

  return (
    <div>
      <Card className="custom-card" style={{ maxHeight: "450px", overflow: "auto" }}>
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
