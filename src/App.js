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
    earn: 0,
    amountStep: 100000,
    incomeAmount: 1000
  });

  const [endPayment, setEndPayment] = useState(200000);
  const [startPayment, setStartPayment] = useState(0);
  const [startTime, setStartTime] = useState(12);
  const [endTime, setEndTime] = useState(360);
  const [payment, setPayment] = useState(200000);
  const [amount, setAmount] = useState(500000);
  const [percent, setPercent] = useState(9);

  const round = (v, r) => {
    const res = Math.round(v / r) * r;
    const fix =
      r.toString().split(".").length > 1
        ? r.toString().split(".")[1].length
        : 0;
    return res.toFixed(fix) * 1;
  };

  const minmax = (v, min, max) => {
    return Math.min(Math.max(v, min), max);
  };

  const resultCalculate = () => {
    let loanAmount;
    let paym;
    let incomeAmount;
    if (values.immovables === true) {
      loanAmount = amount - payment;
    } else if (values.credit === true) {
      loanAmount = amount;
    } else {
      paym = amount / 2;
    }
    const percentMonth = percent / 1200;
    if (values.income !== true) {
      paym = round(
        loanAmount *
          (percentMonth +
            percentMonth / (Math.pow(1 + percentMonth, values.time) - 1)),
        1
      );
    } else {
      loanAmount = round(
        minmax(
          amount /
            ((percentMonth +
              percentMonth / (Math.pow(1 + percentMonth, values.time) - 1)) *
              2),
          300000,
          20000000
        ),
        1
      );
      incomeAmount = loanAmount + payment;
    }
    const repaymentAmount = paym * values.time;
    const earn = round(paym * 2, 1);
    setValues({
      ...values,
      loanAmount: loanAmount,
      resultPayment: paym,
      repaymentAmount: repaymentAmount,
      earn: earn,
      incomeAmount: incomeAmount
    });
  };

  const rangeLimits = () => {
    // Расчет первоначального взноса при изменении стоимости недвижимости
    if (values.immovables === true) {
      if (amount > 20000000) {
        const difference = Math.round(amount - 20000000);
        setStartPayment(difference);
        setPayment(difference);
      } else if (amount < 20000000) {
        setStartPayment(0);
      }

      if (amount < 1700000) {
        const difference = Math.round(amount - 300000);
        setEndPayment(difference);
      } else {
        const difference = Math.round((amount * 80) / 100);
        setEndPayment(difference);
      }
    } else if (values.credit === true) {
      if (amount < 8800000) {
        const rangeLimits = (amount * 83) / 100;
        setEndPayment(rangeLimits);
        setPayment(rangeLimits);
      } else {
        const difference = Math.ceil((amount - 8500000) / 500000);
        const rangeLimits = (amount * (83 - difference)) / 100;
        setEndPayment(rangeLimits);
        setPayment(rangeLimits);
      }
    } else if (values.income === true) {
      if (amount < 364000) {
        const rangeLimits = (amount * 83) / 100;
        setEndPayment(rangeLimits);
        setPayment(rangeLimits);
      } else {
        const difference = Math.ceil((amount - 364000) / 20000);
        const rangeLimits = (amount * (83 - difference)) / 100;
        setEndPayment(rangeLimits);
        setPayment(rangeLimits);
      }
    }
    // } else if (amount < 20000000) {
    //   setStartPayment(0);
    // }

    // if (amount < 1700000) {
    //   const difference = Math.round(amount - 300000);
    //   setEndPayment(difference);
    // } else {
    //   const difference = Math.round((amount * 80) / 100);
    //   setEndPayment(difference);
    // }

    resultCalculate();
  };
  const handleRangeChange = (name, value) => {
    if (name === "payment") {
      setPayment(value);
    }
    if (name === "amount") {
      setAmount(value);
    }
    if (name === "percent") {
      setPercent(value);
    }

    setValues({ ...values, [name]: value });
  };

  const handleInputChange = e => {
    const value = e.target.value;
    const name = e.target.name;
    if (e.target.value !== "month" && e.target.value !== "year") {
      setValues({ ...values, [name]: value });
    }
    resultCalculate();

    if (name === "payment") {
      setPayment(value);
    }

    if (name === "amount") {
      setAmount(value);
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
              className="active"
              onClick={e =>
                setValues({
                  ...values,
                  immovables: true,
                  credit: false,
                  income: false,
                  startAmount: IMMOVABLES_START_LIMITS,
                  endAmount: IMMOVABLES_END_LIMITS,
                  amountStep: 100000
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
                  endAmount: CREDIT_END_LIMITS,
                  amountStep: 100000
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
                  endAmount: INCOME_END_LIMITS,
                  amountStep: 1000
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
        <WrapperInput style={{ marginTop: "-3px" }}>
          <InputRange
            maxValue={values.endAmount}
            minValue={values.startAmount}
            formatLabel={value => `${value.toLocaleString()}`}
            value={amount}
            step={values.amountStep}
            name="amount"
            onChangeComplete={rangeLimits}
            onChange={value => handleRangeChange("amount", value)}
          />

          <PaymentInput
            value={amount}
            type="number"
            name="amount"
            onChange={e => handleInputChange(e)}
          />
        </WrapperInput>
        <InputTitle>Первоначальный взнос</InputTitle>
        <WrapperInput>
          <InputRange
            maxValue={endPayment}
            minValue={startPayment}
            formatLabel={value => `${value}`}
            value={payment}
            step={10000}
            onChangeComplete={resultCalculate}
            onChange={value => handleRangeChange("payment", value)}
          />
          <PaymentInput
            name="payment"
            value={payment}
            type="number"
            onChange={e => handleInputChange(e)}
          />
        </WrapperInput>
        <InputTitle>Процентная ставка</InputTitle>
        <WrapperInput>
          <InputRange
            maxValue={25}
            minValue={9}
            step={0.1}
            formatLabel={value => `${value.toFixed(1)}`}
            value={percent}
            onChangeComplete={resultCalculate}
            onChange={value => handleRangeChange("percent", value)}
          />
          <PaymentInput
            value={percent.toFixed(1)}
            type="number"
            name="percent"
            style={{ width: "61px", marginLeft: "12%" }}
            onChange={e => handleInputChange(e)}
          />
        </WrapperInput>
        <InputTitle>Срок кредита</InputTitle>
        <WrapperInput style={{ paddingLeft: "5.5%" }}>
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
            type="number"
            name="time"
            style={{ width: "65px", marginLeft: "15%" }}
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
        <ResultParagraph>
          {values.income === true
            ? values.incomeAmount.toLocaleString()
            : amount.toLocaleString()}{" "}
          руб.
        </ResultParagraph>
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
  margin-top: -15px;
`;

const SelectTime = styled.input`
  border: 1px solid #1abc9c;
  width: 20px;
  height: 20px;
  border-radius: 10px;
  margin-left: -50px;
`;

const WrapperSelect = styled.ul`
  margin-top: -3px;
  margin-left: -5%
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

  &:hover {
    background-color: #1abc9c;
    color: white;
  }
`;
