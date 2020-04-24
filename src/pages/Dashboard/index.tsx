import React, { useState, useEffect, useMemo } from 'react';
import { parseISO, format } from 'date-fns';
import income from '../../assets/income.svg';
import outcome from '../../assets/outcome.svg';
import total from '../../assets/total.svg';

import api from '../../services/api';

import Header from '../../components/Header';

import formatValue from '../../utils/formatValue';

import { Container, CardContainer, Card, TableContainer } from './styles';

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

const Dashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState<Balance>({} as Balance);

  const formattedBalance = useMemo(() => ({
    income: formatValue(+balance.income || 0),
    outcome: formatValue(+balance.outcome || 0),
    total: formatValue(+balance.total || 0),
  }),
  [balance]);

  useEffect(() => {
    async function loadTransactions(): Promise<void> {
      const response = await api.get<{
        transactions: Transaction[];
        balance: Balance;
      }>('/transactions');

      const {
        transactions: transactionsData,
        balance: balanceData,
      } = response.data;

      const formattedTransactions = transactionsData.map((transaction: Transaction) => ({
        ...transaction,
        formattedValue: `${ transaction.type === 'outcome' ? '-' : ''} ${ formatValue(transaction.value) }`,
        formattedDate: format(new Date(Date.parse(transaction.created_at.toString())), 'dd/MM/yyyy')
      }))

      setTransactions([...formattedTransactions]);

      setBalance(balanceData);
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
            <h1 data-testid="balance-income">{ formattedBalance.income }</h1>
          </Card>
          <Card>
            <header>
              <p>Saídas</p>
              <img src={outcome} alt="Outcome" />
            </header>
            <h1 data-testid="balance-outcome">{ formattedBalance.outcome }</h1>
          </Card>
          <Card total>
            <header>
              <p>Total</p>
              <img src={total} alt="Total" />
            </header>
            <h1 data-testid="balance-total">{ formattedBalance.total }</h1>
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
              { transactions.map(transaction => (
                <tr key={ transaction.id }>
                  <td className="title">{ transaction.title }</td>
                  <td className={ transaction.type }>{ transaction.formattedValue }</td>
                  <td>{ transaction.category.title }</td>
                  <td>{ transaction.formattedDate }</td>
                </tr>
              )) }
            </tbody>
          </table>
        </TableContainer>
      </Container>
    </>
  );
};

export default Dashboard;
