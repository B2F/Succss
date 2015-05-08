#!/usr/bin/env python 
import os,sys,re,subprocess,shutil

from subprocess import call

from optparse import OptionParser
parser = OptionParser()

scriptpath = os.path.dirname(os.path.realpath(__file__))
casperbridge = scriptpath + '/../succss-bridge.js'
requiredArgs = ["casperjs", "test", casperbridge]
allArgs = requiredArgs[:]
allArgs.append('--scriptpath=' + scriptpath)

# this is used to get the lib/imagediff.js and lib/resemble.js files for diffing
npmpath = os.path.join(scriptpath, os.pardir)
libpath = npmpath + '/lib'
allArgs.append('--npmpath=' + npmpath)
allArgs.append('--libpath=' + libpath)

#1. take first sys.argv argument and prepend --action to it, add the resulting string to allArgs list
#2. take the second argument and prepend --dataFile tot it, add the resulting string to allArgs list
#3. append all the remaining options to the allArgs list
if len(sys.argv) > 1:
  action = sys.argv.pop(1)
else:
  call(requiredArgs)
  exit()
if len(sys.argv) > 1:
  dataFile = os.getcwd() + '/' + sys.argv.pop(1)
  allArgs.append("--dataFile=" + dataFile)

verbose = None
logLevel = None
for i, arg in enumerate(sys.argv):
  #clean remaining args:
  if arg.startswith('--'):
    allArgs.append(arg)
    #record logging options
    if arg.startswith('--verbose'):
      verbose = arg
    if arg.startswith('--logLevel'):
      logLevel = arg

#when slimerjs is run with the check command,
#add with slimer then check with phantom
slimerjsCheck = False
args=''.join(sys.argv)
if action == 'check' and re.match('.*--engine=(\'|")?slimerjs(\'|")?', args) and ('--checkDir' not in args):
  action='add'
  slimerjsCheck = True

allArgs.append('--action=' + action)

if slimerjsCheck:

  allArgs.append('--slimerCheck')

  # info logs are needed to pass slimers options to phantomjs, when checking
  if verbose not in allArgs: allArgs.append('--verbose=true')
  if logLevel not in allArgs: allArgs.append('--logLevel=info')

  p=subprocess.Popen(allArgs,stdin=subprocess.PIPE,stdout=subprocess.PIPE)
  print('... SlimerJS is taking captures updates')
  msg = p.communicate()
  if verbose is not None: print(msg[0])
  print('Done')

  # restore initial options:
  msgRe = re.search(r'\[phantom\] \[SucCSS\] Options: (--.*)\n', msg[0])
  if msgRe is not None:
    slimerArgs = msgRe.group(1)

    # restore logging options:
    slimerArgs = slimerArgs.replace(', --verbose=true', '')
    slimerArgs = slimerArgs.replace(', --logLevel=info', '')
    if verbose is not None: slimerArgs = slimerArgs + ', ' + verbose
    if logLevel is not None: slimerArgs = slimerArgs + ', ' + logLevel

    # check with phantomjs engine:
    slimerArgs = slimerArgs.replace('slimerjs', 'phantomjs')

    # check:
    slimerArgs = slimerArgs.replace('--action=add', '--action=check')

    allArgs = requiredArgs + slimerArgs.split(', ')
  else:
    print('An exception was thrown, try running succss with the default engine.')

call(allArgs)