import random
import matplotlib.pyplot as plt
import numpy as np
from scipy.integrate import odeint
import time as fog
# from odeInt import f

parameter = {
    "alpha": [0.4, 0.6],
    "beta": [0.04, 0.06],
    "theta": [0.11, 0.14],
    "gamma": [0.2, 0.93],
    "mu": [0.2, 0.5],
    "omega": [0.01, 0.07],
    "eta": [0.1, 0.16],
    "psi": [0.108, 0.356],
    "phi": [0.16, 0.21],
    "zeta": [0.008, 0.01188],
    "chi": [0.002981, 0.003112],
    "nu": [0.738, 0.902]
}

finalParamValues = [["alpha", 0.5], 
                    ["beta", 0.0424],
                    ["theta", 0.13],
                    ["gamma", 0.9],
                    ["mu", 0.3],
                    ["omega", 0.1],
                    ["eta", 0.05],
                    ["psi", 0.115],
                    ["phi", 0.125],
                    ["zeta",0.008],
                    ["chi",0.003],
                    ["nu",0.8]]

def select() -> float:
    x = np.random.uniform(0, 1, 1)
    return(x)

def calc(func, parameters:tuple) -> float:
    mina = float(parameters[0])
    maxa = float(parameters[1])
    
    return (maxa - mina) * func() + mina

# freeweight = []
# for key, value in enumerate(parameter.items()):
#     freeweight.append(calc(select, value[1]))
# x = [x[0] for x in freeweight]

def dhdt(alpha, h, beta, m, f, theta, p, lamb):
    return alpha*h - beta*h*(m+f) - theta*p*h - lamb*h

def dfdt(gamma, m, f, mu, omega, A, eta):
    return gamma*m*f*(mu**2) - omega*f*A - eta*m*f

def dmdt(gamma, m, f, mu, omega, A, eta):
    return gamma*mu*(1 - mu)*m*f - omega*m*A - eta*m*f
    
def dAdt(psi, A, m, f, phi, zeta, p, lamb):
    return psi*A*(m+f) - phi*A - zeta*p*A - lamb*A

def dpdt(chi, p, h, A, nu):
    return chi*p*(h+A) - nu*p

def normalVector():
    h0 = dhdt(finalParamValues[0][1], 5, finalParamValues[1][1], 2, 1, finalParamValues[2][1], 6, 0.69219)
    f0 = dfdt(finalParamValues[3][1], 2, 1, finalParamValues[4][1], finalParamValues[5][1], 3, finalParamValues[6][1])
    m0 = dmdt(finalParamValues[3][1], 2, 1, finalParamValues[4][1], finalParamValues[5][1], 3, finalParamValues[6][1])
    A0 = dAdt(finalParamValues[7][1], 3, 2, 1, finalParamValues[8][1], finalParamValues[9][1], 6, 0.69219)
    p0 = dpdt(finalParamValues[10][1], 6, 5, 3, finalParamValues[11][1])
    return np.linalg.norm([h0, f0, m0, A0, p0]) - 7.381768218211677
    
def monteCarloNorm(x):
    ds = []
    for i in range(100000):
        finalParamValues[x][1] = calc(select, parameter[finalParamValues[x][0]])[0]
        ds.append(normalVector())
        
    finalParamValues[x][1] = parameter[finalParamValues[x][0]][0]
    ds.append(normalVector())
    finalParamValues[x][1] = parameter[finalParamValues[x][0]][1]
    ds.append(normalVector())
    return ds

        
data = [monteCarloNorm(0), 
        monteCarloNorm(1), 
        monteCarloNorm(2), 
        monteCarloNorm(3), 
        monteCarloNorm(4), 
        monteCarloNorm(5), 
        monteCarloNorm(6), 
        monteCarloNorm(7), 
        monteCarloNorm(8), 
        monteCarloNorm(9), 
        monteCarloNorm(10),
        monteCarloNorm(11)]

fig = plt.figure(figsize =(10, 7))
ax = fig.add_subplot(111)
 
# Creating axes instance
bp = ax.boxplot(data, patch_artist = True,
                notch ='True', vert = 0)
 
colors = ['#0000FF', '#00FF00', 
          '#FFFF00', '#FF00FF']
 
for patch, color in zip(bp['boxes'], colors):
    patch.set_facecolor(color)

for whisker in bp['whiskers']:
    whisker.set(color ='#8B008B',
                linewidth = 1.5,
                linestyle =":")
 

for cap in bp['caps']:
    cap.set(color ='#8B008B',
            linewidth = 2)
 

for median in bp['medians']:
    median.set(color ='red',
               linewidth = 3)

for flier in bp['fliers']:
    flier.set(marker ='D',
              color ='#e7298a',
              alpha = 0.5)
     
ax.set_yticklabels(['alpha', 'beta', 'theta', 'gamma', 'mu', 'omega', 'eta','psi', 'phi', 'zeta', 'chi', 'nu'])
 

plt.title("Sensitivity of initial parameters within range boundary.")
 
ax.get_xaxis().tick_bottom()
ax.get_yaxis().tick_left()
     
plt.show()
plt.savefig('O-A-T_from_mean_sensitivity.png')


