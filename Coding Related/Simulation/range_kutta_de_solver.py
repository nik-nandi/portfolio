import numpy as np
from numpy import sin
from matplotlib import pyplot as plt
import tensorflow as tf

def tstep(t, y, params):
    dydt = np.zeros(5)
    alpha, beta, epsilon, theta, gamma, mu,omega, eta, phi, zeta, chi, roe, nu, psi = params.numpy()
    f = y[0]
    m = y[1]
    a = y[2]
    p = y[3]
    #Fucntions
    dydt[0] = (alpha * r * (1-r)) -(beta * r * m) - (epsilon * r * f) - (theta * p * r)
    dydt[1] = ((gamma * (mu**2) * m * f ) - (omega * f * ap) - (eta * m * f))
    dydt[2] = ((gamma * mu *(roe - mu) * m * f) - (omega * m * ap) - (eta * m * f))
    dydt[3] = (psi * ap * (m + f)) - (phi * ap) - (zeta * p * ap)
    dydt[4] = chi * p * (r + ap) - (nu * p)
    return dydt


def rk4(f, t0, y0, tf, n, params):
    """
    Applies the RK4 method to solve a system of ODEs

    :param f: The system of differential equations, defined as f(t, y), where y is an array
    :param t0: The initial value of t
    :param y0: The initial values of the dependent variables, given as an array
    :param tf: The final value of t
    :param n: The number of steps
    :return: t and y values computed by the RK4 method
    """
    # Define the step size
    h = (tf - t0) / n
    
    # Initialize arrays to store t and y values
    t = np.linspace(t0, tf, n + 1)
    y = np.zeros((n + 1, len(y0)))
    y[0, :] = y0
    
    # Iterate over all steps
    for i in range(n):
        k1 = h * f(t[i], y[i, :], params)
        k2 = h * f(t[i] + 0.5 * h, y[i, :] + 0.5 * k1, params)
        k3 = h * f(t[i] + 0.5 * h, y[i, :] + 0.5 * k2, params)
        k4 = h * f(t[i] + h, y[i, :] + k3, params)
        
        y[i + 1, :] = y[i, :] + (k1 + 2*k2 + 2*k3 + k4) / 6
    
    return t, y

if (__name__ == "__main__"):
    alpha = np.random.rand()*100. 
    beta = np.random.rand()*100.  #beta < epsilon (energy consumption)
    epsilon = np.random.rand()*100. 
    theta = np.random.rand()*100. 
    gamma = np.random.rand()*100. 
    mu =np.random.rand()*100.  #mu < roe (reproduction rate estimate)
    omega = np.random.rand()*100 
    eta = np.random.rand()*100 
    roe = np.random.rand()*100  
    phi = np.random.rand()*100   
    zeta = np.random.rand()*100   
    chi = np.random.rand()*100   
    nu = np.random.rand()*100   
    theta = np.random.rand()*100   
    roe = np.random.rand()*100
    psi = np.random.rand() * 100
    x, y = rk4(tstep, 0, np.array([0.6606332824394557, 0.5021424307765262, 0.9520005911391949, 0.9087044638903202, 0.038050612528414685]), 100, 1000, params= tf.constant([0.9999936054875121, 1.0000236864661096, 1.0000239030067553, 1.0000232108787654, 0.9999756115930454, 0.9999756115930454, 1.0000503449581943, 1.0000487768139092, 0.9999792976928221, 1.0000780771792817, 1.0, 1.0, 31.999970456848104, 2.0]
))
    linObj = plt.plot(x, y)
    plt.legend(linObj, ("r", "f", "m", "ap", "p"))
    plt.show()
