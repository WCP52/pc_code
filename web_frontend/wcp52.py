#!/usr/bin/env python
#
# 

import sys,time,os
from optparse import OptionParser
from functools import wraps
from flask import Flask, request, render_template, g, json, jsonify

# disable pyc files
sys.dont_write_bytecode = True

app = Flask(__name__)

#####################################################
## routes
#####################################################

## index
@app.route('/')
def index():
    """ main site, basically returns the index html page """
    user = request.environ.get('REMOTE_USER')
    if user is None:
        user = 'Anonymous'

    return render_template('index.html', user=user)

## get_phase.json
@app.route('/get_phase.json')
def get_phase():
    '''return phase data points as a json object'''

    # here you would call your method to generate the phase
    # and it should return a dictionary like the one below
    D = { 'phase': { 
                     'x' : [0,1,2,3,4,5,6,7,8,9,10],
                     'y' : [10,30,50,60,12,9,1,23,53,123]
                   }
        }

    return jsonify(**D)

## get_freq.json
@app.route('/get_freq.json')
def get_freq():
    '''return freq data points as a json object'''

    # here you would call your method to generate the freq
    # and it should return a dictionary like the one below
    D = { 'phase': { 
                     'x' : [0,1,2,3,4,5,6,7,8,9,10],
                     'y' : [10,30,50,60,12,9,1,23,53,123]
                   }
        }

    return jsonify(**D)


#####################################################
## helper methods
#####################################################

def get_wcp_obj():
    """ here you can create your wcp obj ( instantiate the class).
    doing so here, will only do it once for the current application context.
    """
    if not hasattr(g, 'wcp'):
        g.wcp = None # instantiate class here
                     # then call the methods with g.wcp.get_phase()
    return g.wcp


if __name__ == '__main__':
    usage = "usage: %prog [options]"
    parser = OptionParser(usage)
    parser.add_option("-n", dest='no_auth',
                      action="store_true",
                      default=False,
                      help="disable ldap authentication requirements [default: %default]")
    (options,args) = parser.parse_args()

    app.debug = True
    app.config['NO_AUTH'] = options.no_auth
    app.run(host='0.0.0.0')


