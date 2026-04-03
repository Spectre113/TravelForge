import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBudget } from '../context/BudgetContext';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { params, setParams } = useBudget();
  const { isAuthenticated } = useAuth();
  const nav = useNavigate();
  const [budgetInput, setBudgetInput] = useState<string>(params.budget.toString());

  // Синхронизируем локальное состояние с глобальным
  useEffect(() => {
    setBudgetInput(params.budget.toString());
  }, [params.budget]);

  const onCalc = () => nav('/results');

  return (
    <>
      {!isAuthenticated && (
        <section className="hero">
          <div className="container">
            <div className="hero__content">
              <h1 className="hero__title">
                Путешествия, которые тебе по карману — и по душе
              </h1>
              <p className="hero__subtitle">
                Бюджетный компас - ваш помощник по поиску лучших маршрутов и впечатлений в рамках своего бюджета
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="form-section">
        <div className="container">
          <h2 className="form-section__title">
            Найдите свое идеальное путешествие
          </h2>
          
          <div className="form-cards">
            <div className="form-card">
              <h3 className="form-card__title">
                Введите параметры для поиска подходящего путешествия
              </h3>
              <div className="form-grid">
                <div>
                  <label className="label">Бюджет, $</label>
                  <input 
                    className="input" 
                    type="number" 
                    value={budgetInput} 
                    onChange={e => {
                      const val = e.target.value;
                      setBudgetInput(val);
                      if (val === '' || val === '-') return;
                      const num = Number(val);
                      if (!Number.isNaN(num) && num >= 0) {
                        setParams({ budget: num });
                      }
                    }}
                    onBlur={e => {
                      const val = e.target.value;
                      if (val === '' || val === '-' || Number(val) < 0) {
                        setBudgetInput(params.budget.toString());
                      }
                    }}
                    placeholder="Введите сумму"
                  />
                </div>
                <div>
                  <label className="label">Город вылета</label>
                  <input 
                    className="input" 
                    value={params.origin} 
                    onChange={e => setParams({ origin: e.target.value })} 
                    placeholder="Откуда летим"
                  />
                </div>
                <div>
                  <label className="label">Дата начала</label>
                  <input 
                    className="input" 
                    type="date" 
                    value={params.startDate} 
                    onChange={e => setParams({ startDate: e.target.value })} 
                  />
                </div>
                <div>
                  <label className="label">Дата конца</label>
                  <input 
                    className="input" 
                    type="date" 
                    value={params.endDate} 
                    onChange={e => setParams({ endDate: e.target.value })} 
                  />
                </div>
              </div>
            </div>

            <div className="form-card">
              <h3 className="form-card__title">
                Укажите насколько вам важны следующие факторы
              </h3>
              <div className="form-grid single">
                <div className="slider-container">
                  <div className="slider-label">
                    <label className="label">Культура</label>
                    <span className="slider-value">{params.prefCulture}%</span>
                  </div>
                  <input 
                    type="range" 
                    min={0} 
                    max={100} 
                    value={params.prefCulture} 
                    onChange={e => setParams({ prefCulture: Number(e.target.value) })} 
                  />
                </div>
                
                <div className="slider-container">
                  <div className="slider-label">
                    <label className="label">Природа</label>
                    <span className="slider-value">{params.prefNature}%</span>
                  </div>
                  <input 
                    type="range" 
                    min={0} 
                    max={100} 
                    value={params.prefNature} 
                    onChange={e => setParams({ prefNature: Number(e.target.value) })} 
                  />
                </div>
                
                <div className="slider-container">
                  <div className="slider-label">
                    <label className="label">Ночная жизнь</label>
                    <span className="slider-value">{params.prefParty}%</span>
                  </div>
                  <input 
                    type="range" 
                    min={0} 
                    max={100} 
                    value={params.prefParty} 
                    onChange={e => setParams({ prefParty: Number(e.target.value) })} 
                  />
                </div>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <button className="btn" onClick={onCalc} style={{ fontSize: '1.125rem', padding: '1rem 3rem' }}>
              Рассчитать путешествие
            </button>
          </div>
        </div>
      </section>
    </>
  );
}