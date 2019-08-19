import React, { useState } from "react";
import "./App.css";
import "react-input-range/lib/css/index.css";
import styled from "styled-components";
import InputRange from "react-input-range";
import { PaymentTitle } from "./utils.js";
import {
  IMMOVABLES_START_LIMITS,
  IMMOVABLES_END_LIMITS,
  CREDIT_START_LIMITS,
  CREDIT_END_LIMITS,
  INCOME_START_LIMITS,
  INCOME_END_LIMITS
} from "./constants.js";

function App() {
  const [values, setValues] = useState({
    amount: 500000,
    percent: 9,
    time: 60,
    year: false,
    month: true,
    immovables: true,
    credit: false,
    income: false,
    startAmount: 500000,
    endAmount: 50000000,
    loanAmount: 0,
    resultPayment: 0,
    repaymentAmount: 0,
    earn: 0
  });

  const [endPayment, setEndPayment] = useState(200000);
  const [startPayment, setStartPayment] = useState(0);
  const [startTime, setStartTime] = useState(12);
  const [endTime, setEndTime] = useState(360);
  const [payment, setPayment] = useState(200000);

  const round = (v, r) => {
    const res = Math.round(v / r) * r;
    const fix =
      r.toString().split(".").length > 1
        ? r.toString().split(".")[1].length
        : 0;
    return res.toFixed(fix) * 1;
  };

  const resultCalculate = name => {
    let loanAmount;
    if (values.immovables === true) {
      loanAmount = values.amount - payment;
    } else if (values.credit === true) {
      loanAmount = values.amount;
    } else {
      loanAmount = values.amount - payment;
    }
    const percentMonth = values.percent / 1200;
    const paym = round(
      loanAmount *
        (percentMonth +
          percentMonth / (Math.pow(1 + percentMonth, values.time) - 1)),
      1
    );
    const repaymentAmount = paym * values.time;
    const earn = round(paym * 2, 1);
    setValues({
      ...values,
      loanAmount: loanAmount,
      resultPayment: paym,
      repaymentAmount: repaymentAmount,
      earn: earn
    });
  };

  const rangeLimits = () => {
    // Расчет первоначального взноса при изменении стоимости недвижимости
    if (values.amount > 20000000) {
      const difference = Math.round(values.amount - 20000000);
      setStartPayment(difference);
      setPayment(difference);
    } else if (values.amount < 20000000) {
      setStartPayment(0);
    }

    if (values.amount < 1700000) {
      const difference = Math.round(values.amount - 300000);
      setEndPayment(difference);
    } else {
      const difference = Math.round((values.amount * 80) / 100);
      setEndPayment(difference);
    }
    resultCalculate();
  };
  const handleRangeChange = (name, value) => {
    if (name === "payment") {
      setPayment(value);
    }
    setValues({ ...values, [name]: value });
  };

  const handleInputChange = e => {
    const value = e.target.value;
    const name = e.target.name;
    if (e.target.value !== "month" && e.target.value !== "year") {
      setValues({ ...values, [name]: value });
    }

    if (name === "payment") {
      setPayment(value);
    }

    if (e.target.value === "year") {
      const actualTime = Math.ceil(values.time / 12);
      setValues({
        ...values,
        year: true,
        month: false,
        time: actualTime
      });
      setStartTime(1);
      setEndTime(30);
    }

    if (e.target.value === "month") {
      const actualTime = values.time * 12;
      setValues({
        ...values,
        year: false,
        month: true,
        time: actualTime
      });
      setStartTime(12);
      setEndTime(360);
    }
  };
  return (
    <CalculatorApp>
      <Calculator>
        <SelectCalculate>
          <li>
            <SelectInput
              type="button"
              name="immovables"
              onClick={e =>
                setValues({
                  ...values,
                  immovables: true,
                  credit: false,
                  income: false,
                  startAmount: IMMOVABLES_START_LIMITS,
                  endAmount: IMMOVABLES_END_LIMITS
                })
              }
              value="По стоимости недвижимости"
            />
          </li>
          <li>
            <SelectInput
              type="button"
              name="credit"
              onClick={e =>
                setValues({
                  ...values,
                  immovables: false,
                  credit: true,
                  income: false,
                  startAmount: CREDIT_START_LIMITS,
                  endAmount: CREDIT_END_LIMITS
                })
              }
              value="По сумме кредита"
            />
          </li>
          <li>
            <SelectInput
              onClick={e =>
                setValues({
                  ...values,
                  immovables: false,
                  credit: false,
                  income: true,
                  startAmount: INCOME_START_LIMITS,
                  endAmount: INCOME_END_LIMITS
                })
              }
              type="button"
              value="По размеру дохода"
            />
          </li>
        </SelectCalculate>
        <InputTitle>
          <PaymentTitle credit={values.credit} immovables={values.immovables} />
        </InputTitle>
        <WrapperInput>
          <InputRange
            maxValue={values.endAmount}
            minValue={values.startAmount}
            formatLabel={value => `${value.toLocaleString()}`}
            value={values.amount}
            step={100000}
            name="amount"
            onChangeComplete={rangeLimits}
            onChange={value => handleRangeChange("amount", value)}
          />

          <PaymentInput
            value={values.amount.toLocaleString()}
            type="text"
            name="amount"
            onChange={e => handleInputChange(e)}
          />
        </WrapperInput>
        <InputTitle>Первоначальный взнос</InputTitle>
        <WrapperInput>
          <InputRange
            maxValue={endPayment}
            minValue={startPayment}
            formatLabel={value => `${value.toLocaleString()}`}
            value={payment}
            step={10000}
            onChangeComplete={resultCalculate}
            onChange={value => handleRangeChange("payment", value)}
          />
          <PaymentInput
            name="payment"
            value={payment.toLocaleString()}
            type="text"
            onChange={e => handleInputChange(e)}
          />
        </WrapperInput>
        <InputTitle>Процентная ставка</InputTitle>
        <WrapperInput>
          <InputRange
            maxValue={25}
            minValue={9}
            value={values.percent}
            onChangeComplete={resultCalculate}
            onChange={value => handleRangeChange("percent", value)}
          />
          <PaymentInput
            value={values.percent}
            type="text"
            name="percent"
            style={{ width: "61px" }}
            onChange={e => handleInputChange(e)}
          />
        </WrapperInput>
        <InputTitle>Срок кредита</InputTitle>
        <WrapperInput>
          <InputRange
            maxValue={endTime}
            minValue={startTime}
            step={1}
            value={values.time}
            onChangeComplete={resultCalculate}
            onChange={value => handleRangeChange("time", value)}
          />
          <PaymentInput
            value={values.time}
            type="text"
            name="time"
            style={{ width: "61px", marginLeft: "0px" }}
            onChange={e => handleInputChange(e)}
          />
          <WrapperSelect>
            <li>
              <SelectTime
                id="one"
                value="year"
                checked={values.year}
                onChange={e => handleInputChange(e)}
                type="radio"
              />
              <label htmlFor="one">лет</label>
            </li>
            <li>
              <SelectTime
                id="two"
                value="month"
                checked={values.month}
                onChange={e => handleInputChange(e)}
                type="radio"
              />
              <label htmlFor="two">месяцев</label>
            </li>
          </WrapperSelect>
        </WrapperInput>
      </Calculator>
      <Result>
        <ResultTitle>Ежемесячный платеж</ResultTitle>
        <ResultParagraph style={{ fontWeight: "600", color: "black" }}>
          {values.resultPayment.toLocaleString()} руб.
        </ResultParagraph>
        <ResultTitle>Размер кредита</ResultTitle>
        <ResultParagraph>
          {values.loanAmount.toLocaleString()} руб.
        </ResultParagraph>
        <ResultTitle>Сумма выплат по кредиту</ResultTitle>
        <ResultParagraph>
          {values.repaymentAmount.toLocaleString()} руб.
        </ResultParagraph>
        <ResultTitle>Стоимость недвижимости</ResultTitle>
        <ResultParagraph>{values.amount.toLocaleString()} руб.</ResultParagraph>
        <ResultTitle>Срок выплат</ResultTitle>
        <ResultParagraph>
          {values.year === true ? values.time : Math.ceil(values.time / 12)} лет
        </ResultParagraph>
        <ResultTitle>Необходимый ежемесячный доход</ResultTitle>
        <ResultParagraph>{values.earn.toLocaleString()} руб.</ResultParagraph>
      </Result>
    </CalculatorApp>
  );
}

export default App;

const CalculatorApp = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
`;

const Calculator = styled.div`
  font-size: 17px;
  font-family: "Nunito", sans-serif;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  text-align: left;
  flex-wrap: wrap;
  flex: 99;
  width: 70%;
  height: 540px;
  background: #f0f8fb;
  order: 1;
`;

const PaymentInput = styled.input`
  width: 15%;
  min-height: 35px;
  max-height: 35px;
  border: 1px solid #1abc9c;
  margin-left: 30px;
  text-align: right;
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
  padding-right: 12px;
`;

const WrapperInput = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-around;
  margin-top: 30px;
  padding-left: 15px;
  width: 100%;
`;

const InputTitle = styled.label`
  font-size: 18px;
  padding-left: 15px;
`;

const Result = styled.div`
  display: flex;
  min-width: 30%;
  background: #fefdf0;
  order: 2;
  flex-direction: column;
  flex: 1 0 300px;
`;

const ResultTitle = styled.p`
  font-size: 18px;
  color: #666;
  padding-left: 20px;
`;

const ResultParagraph = styled.p`
  font-size: 22px;
  font-weight: bold;
  color: #666;
  padding-left: 20px;
  margin-top: auto;
`;

const SelectTime = styled.input`
  border: 1px solid #1abc9c;
  width: 20px;
  height: 20px;
  border-radius: 10px;
  margin-left: -50px;
`;

const WrapperSelect = styled.ul`
  margin-top: -10px;
  list-style-type: none;
`;

const SelectCalculate = styled.ul`
  font-size: 16px;
  display: inline-flex;
  flex-wrap: wrap
  width: 100%;
  list-style-type: none;
`;

const SelectInput = styled.input`
  border: 1px solid #1abc9c;
  height: 36px;
  background-color: #fff;
  padding: 10px;
  cursor: pointer;

  &:focus {
    background-color: #1abc9c;
    color: white;
  }
`;
