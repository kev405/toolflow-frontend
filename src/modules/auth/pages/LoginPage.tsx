import React from 'react';
import { LoginForm } from '../components/LoginForm';
import loginBg from '../assets/logo-code-flow.png';

const LoginPage = () => {
  return (
    <div className="bg-gradient-primary">
      {/* Elimina mx-auto y px-4 de container */}
      <div className="container">
        {/* Elimina flex y justify-center de row */}
        <div className="row justify-content-center align-items-center vh-100 w-100">
          <div className="col-xl-10 col-lg-12 col-md-9">
            <div className="card o-hidden border-0 shadow-lg my-5">
              <div className="card-body p-0">
                <div className="row">
                  <div className="col-lg-6 d-none d-lg-block p-0"> {/* Añade p-0 */}
                    <div 
                      className="h-100" 
                      data-testid="login-image"
                      style={{
                        backgroundImage: `url(${loginBg})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        minHeight: '100%'
                      }}
                    />
                  </div>
                  <div className="col-lg-6 p-5"> {/* Añade padding */}
                    <LoginForm />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;