import styled from 'styled-components';

export const FeatureManagerContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 8px;
`;

export const Section = styled.section`
  background: white;
  padding: 1.5rem;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  h3 {
    color: #2c3e50;
    margin-bottom: 1.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #e9ecef;
  }
`;

export const FeatureCard = styled.div`
  background: #ffffff;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1rem;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

export const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: .4s;
    border-radius: 34px;

    &:before {
      position: absolute;
      content: "";
      height: 26px;
      width: 26px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      transition: .4s;
      border-radius: 50%;
    }
  }

  input:checked + span {
    background-color: #2196F3;
  }

  input:checked + span:before {
    transform: translateX(26px);
  }
`;

export const Button = styled.button`
  background: #4dabf7;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;

  &:hover {
    background: #339af0;
  }

  &:disabled {
    background: #dee2e6;
    cursor: not-allowed;
  }
`;

export const StatusIndicator = styled.div<{ status: 'operational' | 'degraded' | 'failed' }>`
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 16px;
  font-size: 0.875rem;
  font-weight: 500;

  ${({ status }) => {
    switch (status) {
      case 'operational':
        return 'background: #d3f9d8; color: #2b8a3e;';
      case 'degraded':
        return 'background: #fff3bf; color: #f08c00;';
      case 'failed':
        return 'background: #ffe3e3; color: #e03131;';
    }
  }}
`; 