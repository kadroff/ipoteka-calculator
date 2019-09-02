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
    rub: true,
    percentRadio: false,
    immovables: true,
    credit: false,
    income: false,
    startAmount: 500000,
    endAmount: 50000000,
    loanAmount: 500000,
    resultPayment: 6228,
    repaymentAmount: 373680,
    earn: 12456,
    amountStep: 100000,
    incomeAmount: 500000,
    paymentStep: 10000,
    amount: 500000
  });

  const [endPayment, setEndPayment] = useState(200000);
  const [startPayment, setStartPayment] = useState(0);
  const [startTime, setStartTime] = useState(12);
  const [endTime, setEndTime] = useState(360);
  const [payment, setPayment] = useState(200000);
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
      if (values.percentRadio === true) {
        loanAmount = values.amount - (values.amount * payment) / 100;
      } else {
        loanAmount = values.amount - payment;
      }
    } else if (values.credit === true) {
      loanAmount = values.amount;
    } else {
      paym = values.amount / 2;
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
          values.amount /
            ((percentMonth +
              percentMonth / (Math.pow(1 + percentMonth, values.time) - 1)) *
              2),
          300000,
          20000000
        ),
        1
      );
    }
    if (values.immovables !== true) {
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

  const creditRangeLimits = () => {
    const labelMax = round(
      Math.min(values.amount / 0.2, 50000000 - values.amount),
      10000
    );
    return labelMax;
  };

  const earnRangeLimits = () => {
    const percentMonth = percent / 1200;
    const maxAmount = round(
      minmax(
        values.amount /
          ((percentMonth +
            percentMonth / (Math.pow(1 + percentMonth, values.time) - 1)) *
            2),
        300000,
        20000000
      ),
      1
    );

    const labelMax = round(
      Math.min(maxAmount / 0.2, 50000000 - maxAmount),
      10000
    );
    return labelMax;
  };

  const rangeLimits = () => {
    // Расчет первоначального взноса при изменении стоимости недвижимости
    if (values.percentRadio === false) {
      if (values.immovables === true) {
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
        // Расчет первоначального взноса при изменении стоимости кредита
      } else if (values.credit === true) {
        setStartPayment(0);
        setEndPayment(creditRangeLimits());
        setPayment(0);
      } else {
        setStartPayment(0);
        setEndPayment(earnRangeLimits());
        setPayment(0);
      }
    }

    if (values.amount > 20200000 && values.percentRadio === true) {
      const difference = (
        Math.round(values.amount - 20000000) / 500000
      ).toFixed();
      setStartPayment(Number(difference));
    }

    resultCalculate();
  };
  const handleRangeChange = (name, value) => {
    if (name === "payment") {
      setPayment(value);
    }
    if (name === "percent") {
      setPercent(value);
      rangeLimits();
    }

    // Расчет диапазона первоначального платежа при %

    setValues({ ...values, [name]: value });
    creditRangeLimits();
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

    // Радио кнопки первоначального взноса

    if (e.target.value === "percentRadio" && values.immovables === true) {
      setValues({
        ...values,
        percentRadio: true,
        rub: false,
        paymentStep: 1
      });
      setStartPayment(0);
      setEndPayment(80);
      setPayment(0);
    }
    if (e.target.value === "rub" && values.immovables === true) {
      let newPayment = (values.amount * payment) / 100;
      const newStartPayment = (values.amount * startPayment) / 100;
      setValues({
        ...values,
        percentRadio: false,
        rub: true
      });
      if (values.amount > 20000000) {
        setStartPayment(newStartPayment);
      } else {
        setStartPayment(0);
      }
      if (newStartPayment > newPayment) {
        newPayment += 100000;
      }
      setEndPayment(newPayment);
      setPayment(newPayment);
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
                  amountStep: 100000,
                  paymentStep: 10000,
                  amount: IMMOVABLES_END_LIMITS
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
                  amountStep: 100000,
                  paymentStep: 10000,
                  amount: CREDIT_END_LIMITS
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
                  amountStep: 1000,
                  paymentStep: 1000,
                  amount: INCOME_END_LIMITS
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
            value={values.amount}
            step={values.amountStep}
            name="amount"
            onChangeComplete={rangeLimits}
            onChange={value => handleRangeChange("amount", value)}
          />

          <PaymentInput
            value={values.amount}
            type="number"
            name="number"
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
            step={values.paymentStep}
            onChangeComplete={resultCalculate}
            onChange={value => handleRangeChange("payment", value)}
          />
          <PaymentInput
            name="payment"
            value={payment}
            type="number"
            onChange={e => handleInputChange(e)}
          />
          <WrapperSelect>
            <li>
              <SelectTime
                id="percent"
                value="percentRadio"
                checked={values.percentRadio}
                onChange={e => handleInputChange(e)}
                type="radio"
              />
              <label htmlFor="percent">%</label>
            </li>
            <li>
              <SelectTime
                id="rub"
                value="rub"
                checked={values.rub}
                onChange={e => handleInputChange(e)}
                type="radio"
              />
              <label htmlFor="rub">руб</label>
            </li>
          </WrapperSelect>
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
          {values.incomeAmount !== undefined
            ? values.incomeAmount.toLocaleString()
            : values.amount.toLocaleString()}{" "}
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
  height: 570px;
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
