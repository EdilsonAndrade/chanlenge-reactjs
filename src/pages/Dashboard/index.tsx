import React, { useState, useEffect } from 'react';
import {format} from 'date-fns';
import pt from 'date-fns/locale/pt';
import income from '../../assets/income.svg';
import outcome from '../../assets/outcome.svg';
import total from '../../assets/total.svg';

import api from '../../services/api';
import formatValue from '../../utils/formatValue';
import Header from '../../components/Header';

import { Container, CardContainer, Card, TableContainer } from './styles';
import { triggerAsyncId } from 'async_hooks';
import { isUndefined } from 'util';


interface Transaction {
  id: string;
  title: string;
  value: number;
  formattedValue: string;
  formattedDate: string;
  type: 'income' | 'outcome';
  category: { title: string };
  created_at: Date;
}

interface Balance {
  income: string;
  outcome: string;
  total: string;
}

interface TransactionResponse{
  transactions: Transaction[];
  balance: Balance; 
}
const Dashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState<Balance>({} as Balance);

  useEffect(() => {
    async function loadTransactions(): Promise<void> {
      const response = await api.get<TransactionResponse>('/transactions');

      const transformedTransaction = response.data.transactions.map(transaction=>({
        ...transaction,
         formattedDate: format(new Date(transaction.created_at), "dd/MM/yyyy", { locale: pt }),
         formattedValue: formatValue(transaction.value)
        }))

      setTransactions(transformedTransaction)

      const {income, outcome, total} = response.data.balance;

      setBalance({
        income: formatValue(Number(income)),
        total: formatValue(Number(total)),
        outcome: formatValue(Number(outcome))

      });
    }

    loadTransactions();

  }, []);

  return (
    <>
      <Header />
      <Container>
        <CardContainer>
          <Card>
            <header>
              <p>Entradas</p>
              <img src={income} alt="Income" />
            </header>
            <h1 data-testid="balance-income">{balance.income} </h1>
          </Card>
          <Card>
            <header>
              <p>Saídas</p>
              <img src={outcome} alt="Outcome" />
            </header>
            <h1 data-testid="balance-outcome">{balance.outcome}</h1>
          </Card>
          <Card total>
            <header>
              <p>Total</p>
              <img src={total} alt="Total" />
            </header>
            <h1 data-testid="balance-total">{balance.total}</h1>
          </Card>
        </CardContainer>

        <TableContainer>
          <table>
            <thead>
              <tr>
                <th>Título</th>
                <th>Preço</th>
                <th>Categoria</th>
                <th>Data</th>
              </tr>
            </thead>

            <tbody>
              {transactions.map((transaction)=>(
                <tr key={transaction.id}>
                  <td className="title">{transaction.title} </td>
                  <td className={transaction.type}>{` ${transaction.type === "income" ? "" : "-"} ${transaction.formattedValue}`}</td>
                  <td>{transaction.category.title}</td>
                  <td>{transaction.formattedDate}</td>
                </tr>
              ))}
             
            
            </tbody>
          </table>
        </TableContainer>
      </Container>
    </>
  );
};

export default Dashboard;
