import numpy as np
from scipy.integrate import odeint
from matplotlib import pyplot as plt

#Model
def f(s, t):
    xi = 1 # general predation multiplier
    # roe/2 >= mu
    alpha = 0.5
    beta = 0.09 #beta < epsilon (energy consumption)
    epsilon = 0.05
    theta = 0.35
    gamma = 0.55
    mu = 0.4 #mu < roe (reproduction rate estimate)
    omega = 0.05
    eta = 0.05
    roe = 0.8
    phi = 0.035
    zeta = 0.1188
    chi = 0.3112
    psi = 0.4
    nu = 0.1

    
    #Variables
    r = s[0]
    f = s[1]
    m = s[2]
    ap = s[3]
    p = s[4]
    
    #Fucntions
    drdt = (alpha * r * (1-r)) -(beta * r * m) - (epsilon * r * f) - (theta * p * r) + 0.019877178439600005
    dfdt = ((gamma * (mu**2) * m * f ) - (omega * f * ap) - (eta * m * f))
    dmdt = ((gamma * mu *(roe - mu) * m * f) - (omega * m * ap) - (eta * m * f))
    dapdt = (psi * ap * (m + f)) - (phi * ap) - (zeta * p * ap) + 0.004279613676800001
    dpdt = chi * p * (r + ap) - (nu * p)
    
    if (t == 0):
        print([drdt, dfdt, dmdt, dapdt, dpdt])
    
    print(r, f, m, ap, p)
        
    return [drdt, dfdt, dmdt, dapdt, dpdt]

def f_params(s, t, params):
    xi = 1 # general predation multiplier
    # roe/2 >= mu
    alpha = 0.5
    beta = 0.09 #beta < epsilon (energy consumption)
    epsilon = 0.05
    theta = 0.35
    gamma = 0.55
    mu = 0.4 #mu < roe (reproduction rate estimate)
    omega = 0.05
    eta = 0.05
    roe = 0.8
    phi = 0.035
    zeta = 0.1188
    chi = 0.3112
    psi = 0.4
    nu = 0.1

    
    r = s[0]
    f = s[1]
    m = s[2]
    ap = s[3]
    p = s[4]
    
    #Fucntions
    drdt = (alpha * r * (1-r)) -(beta * r * m) - (epsilon * r * f) - (theta * p * r) + 0.019877178439600005
    dfdt = ((gamma * (mu**2) * m * f ) - (omega * f * ap) - (eta * m * f))
    dmdt = ((gamma * mu *(roe - mu) * m * f) - (omega * m * ap) - (eta * m * f))
    dapdt = (psi * ap * (m + f)) - (phi * ap) - (zeta * p * ap) + 0.004279613676800001
    dpdt = chi * p * (r + ap) - (nu * p)
    
    if (t == 0):
        print([drdt, dfdt, dmdt, dapdt, dpdt])
    
    print(r, f, m, ap, p)
        
    return [drdt, dfdt, dmdt, dapdt, dpdt]

#Initial Conditions
i0 = [0.28511, 0.132374, 0.132374, 0.100604, 1.41798]

#Spacing Density
t = np.linspace(0, 10, 1000) 

sol, infodict = odeint(f, i0, t, full_output=1)

plt.plot(t, sol[:, 0], label='r(t)')
plt.plot(t, sol[:, 1], label='f(t)')
plt.plot(t, sol[:, 2], label='m(t)')
plt.plot(t, sol[:, 3], label='ap(t)')
plt.plot(t, sol[:, 4], label='p(t)')
plt.legend(["R","F","M","AP","P"])
plt.show()

print(infodict['message'])