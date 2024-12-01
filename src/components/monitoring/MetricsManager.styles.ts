import styled from 'styled-components';

export const MetricsManagerContainer = styled.div`
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  h2 {
    color: #2c3e50;
    margin-bottom: 1.5rem;
    border-bottom: 2px solid #e9ecef;
    padding-bottom: 0.5rem;
  }
`;

export const Section = styled.div`
  margin-bottom: 2rem;
  background: white;
  padding: 1.5rem;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

export const Form = styled.form`
  display: grid;
  gap: 1rem;
  max-width: 600px;

  input, select {
    padding: 0.75rem;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    font-size: 0.9rem;

    &:focus {
      outline: none;
      border-color: #4dabf7;
      box-shadow: 0 0 0 2px rgba(77, 171, 247, 0.2);
    }
  }

  button {
    background: #4dabf7;
    color: white;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    transition: background 0.2s;

    &:hover {
      background: #339af0;
    }
  }
`;

export const MetricsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    padding: 0.75rem;
    border-bottom: 1px solid #e9ecef;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;

    &:hover {
      background: #f1f3f5;
    }

    .metric-name {
      font-weight: 500;
    }

    .metric-unit {
      color: #868e96;
      font-size: 0.9rem;
    }
  }
`;

export const MetricDetails = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 6px;
  margin-top: 1rem;

  h3 {
    margin-top: 0;
    color: #2c3e50;
  }

  .metric-chart {
    margin: 1rem 0;
    height: 200px;
  }

  .metric-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    margin-top: 1rem;

    .stat-card {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 4px;
      text-align: center;

      .stat-value {
        font-size: 1.5rem;
        font-weight: 600;
        color: #4dabf7;
      }

      .stat-label {
        color: #868e96;
        font-size: 0.9rem;
        margin-top: 0.5rem;
      }
    }
  }
`; 