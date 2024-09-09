import tensorflow as tf
import numpy as np
from tensorflow.math import sin
from range_kutta import rk4, tstep
from itertools import product
from matplotlib import pyplot as plt
from range_kutta import rk4, f

alpha = tf.cast(1, tf.float64)
beta = 0.1
j = tf.cast(1., tf.float64)
i = 0.1
omega = 0.2
q = 0.1
psi = 1
sigma = 0.1
epsilon = 0.1
rho = 1.
eta = 1.
delta = 0.1
theta = 1.0
from itertools import product

def sin2n(t):
    return tf.cast(((sin(t))**14), tf.float64)


def f_with_grad(t, y):
    y = tf.convert_to_tensor(y)
    with tf.GradientTape(persistent=True) as g:
        # watch variables
        g.watch(y)
        # apply transforms
        dydt_1 = alpha*y[0]*(1-y[0]) - beta * y[0] * (y[3] + y[2]) - epsilon * y[0] * y[2]
        dydt_2 = sin2n(t)*j*y[3]*y[2] - i*y[1]*y[5]-theta*y[1]*y[6]
        dydt_3 = theta*y[1]*y[6]-omega*y[2]*y[4]-sin2n(t)*y[3]*y[2]*eta
        dydt_4 = theta*y[1]*y[6]*(rho- y[6]) - omega*y[3]*y[4] - sin2n(t)*y[3]*y[2]*eta
        dydt_5 = psi*y[4]*(y[3] + y[2]) - q*y[4]
        dydt_6 = sigma*y[5]*y[1] - q*y[5]
        dydt_7 = y[1] * y[6] - delta * y[1] * y[6]
    grads = [
        -g.gradient(dydt_1, y),
        -g.gradient(dydt_2, y),
        -g.gradient(dydt_3, y),
        -g.gradient(dydt_4, y),
        -g.gradient(dydt_5, y),
        -g.gradient(dydt_6, y),
        -g.gradient(dydt_7, y)
    ]
    del g
    out = np.zeros(7)
    for d in range(7):
        tmp = 0
        for k in range(7):
            tmp += grads[k][d]
        out[d] = tmp
    return np.array([dydt_1, dydt_2, dydt_3, dydt_4, dydt_5, dydt_6, dydt_7]), out

"""
[alpha, beta, epsilon, theta, gamma, mu,omega, eta, phi, zeta, chi, roe, nu, psi]
"""

def f_with_grad_parameters(t, y, params):
    params = tf.convert_to_tensor(params)
    with tf.GradientTape(persistent=True) as g:
        # watch variables
        g.watch(params)
        r = y[len(y) - 1][0]
        f = y[len(y) - 1][1]
        m = y[len(y) - 1][2]
        ap = y[len(y) - 1][3]
        p = y[len(y) - 1][4]
        # apply transforms
        dydt_1 = (params[0] * r * (1 - r)) - (params[1] * r * m) - (params[2] * r * f) - (params[3] * p * r)
        dydt_2 = (params[4] * params[5] * m * f ) - (params[6] * f * ap) - (params[7] * m * f) 
        dydt_3 = (params[4] * (params[11] - params[5]) * m * f) - (params[6] * m * ap) - (params[7] * m * f)
        dydt_4 = (params[10] * ap * (m + f)) - (params[8] * ap) - (params[9] * p * ap)
        dydt_5 = params[9] * p * (r + ap) - (params[12] * p)

        loss1 = abs(params[0] * r * (1 - r)) - (params[1] * r * m) - (params[2] * r * f) - (params[3] * p * r)
        loss2 = abs(params[4] * params[5] * m * f ) - (params[6] * f * ap) - (params[7] * m * f)
        loss3 = abs(params[4] * (params[11] - params[5]) * m * f) - (params[6] * m * ap) - (params[7] * m * f)
        loss4 = abs(params[8] * ap * (m + f)) - (params[8] * ap) - (params[9] * p * ap)
        loss5 = abs(params[9] * p * (r + ap) - (params[12] * p))
        
    grads = [
        g.gradient(loss1, params),
        g.gradient(loss2, params),
        g.gradient(loss3, params),
        g.gradient(loss4, params),
        g.gradient(loss5, params)
    ]
    del g
    out = np.zeros(14)
    for d in range(14):
        tmp = 0
        for k in range(5):
            tmp += grads[k][d]
        out[d] = tmp
    return np.array([dydt_1, dydt_2, dydt_3, dydt_4, dydt_5]), out

def search(t0, y0):
    y = tf.Variable(y0, trainable=True)
    dydt, grads = f_with_grad(t0, y)
    while np.linalg.norm(dydt) != 0:
        y.assign_sub(grads)
        dydt, grads = f_with_grad(t0, y)
    
    return y

def search_params(t0, y0, params):
    params = tf.Variable(params)
    prev_grads = tf.zeros(13)
    prev_dydt = tf.zeros(5)
    t, y = rk4(tstep, t0, y0, 100, 1000, params)
    dydt, grads = f_with_grad_parameters(t, [y], params)
    succ = True
    if np.isnan(np.linalg.norm(dydt)):
        succ = False
    while (np.linalg.norm(dydt) > 1):
        if np.isnan(np.linalg.norm(dydt)):
            succ = False
            break
        try:
            params.assign_sub(0.00001 * grads)
            t, y = rk4(tstep, t0, y0, 100, 1000, params)
            prev_grads = grads
            prev_dydt = dydt
            dydt, grads = f_with_grad_parameters(t, y, params)
            print(np.linalg.norm(dydt))
            if np.isnan(np.linalg.norm(dydt)):
                succ = False
                break
        except KeyboardInterrupt:
            break
    for i in range(len(y[len(y) - 1])):
        if (y[len(y) - 1][i] < 0.001):
            succ = False
            break
    return succ, params


def supersearch():
    params = None
    for alpha, beta, epsilon, theta, gamma, mu,omega, eta, phi, zeta, chi, roe, nu, psi in product(range(1, 100), repeat=14):
        succ = False
        initialVal = np.array([np.random.rand(), np.random.rand(), np.random.rand(), np.random.rand(), np.random.rand()])
        succ, params = search_params(0., initialVal, np.array([float(alpha), float(beta), float(epsilon), float(theta), float(gamma), float(mu),float(omega), float(eta), float(phi), float(zeta), float(chi), float(roe), float(nu), float(psi)/10.]))
        if (succ):
            with open("./out5.txt", "a+") as f:
                f.write("\n\n")
                f.write("iv:\n")
                f.write(str(initialVal.tolist()))
                f.write("params:\n")
                f.write(str(params.numpy().tolist()))
    return params

def unpacker(x: list) -> list[list]:
    pass
if (__name__ == "__main__"):

    supersearch()