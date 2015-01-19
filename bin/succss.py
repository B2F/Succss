#!/usr/bin/env python 
import os,sys,re,subprocess,shutil

from subprocess import call

from optparse import OptionParser
parser = OptionParser()

scriptpath = os.path.dirname(os.path.realpath(__file__)) 
casperbridge = scriptpath + '/../succss-bridge.js'
requiredArgs = ["casperjs", "test", casperbridge]
allArgs = requiredArgs[:]

#1. take first sys.argv argument and prepend --do to it, add the resulting string to allArgs list
#2. take the second argument and prepend --dataFile tot it, add the resulting string to allArgs list
#3. append all the remaining options to the allArgs list
if len(sys.argv) > 1:
  do = sys.argv.pop(1)
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
if do == 'check' and re.match('.*--engine=(\'|")?slimerjs(\'|")?', args) and ('--checkDir' not in args):
  do='add'
  slimerjsCheck = True

allArgs.append('--do=' + do)

if slimerjsCheck:

  # adding tmp updates with slimerjs
  slimerTmp = '.slimer-tmp'
  allArgs.append('--rootDir='+slimerTmp)

  # info logs are needed to pass slimers options to phantomjs, when checking
  if verbose is not None:
    allArgs.pop(allArgs.index(verbose))
  if logLevel is not None:
    allArgs.pop(allArgs.index(logLevel))
  allArgs.append('--verbose=true')
  allArgs.append('--logLevel=info')

  p=subprocess.Popen(allArgs,stdin=subprocess.PIPE,stdout=subprocess.PIPE)
  print('... Taking captures updates')
  msg = p.communicate()
  print('Done')

  # restore initial options:
  msgRe = re.search(r'\[phantom\] \[SucCSS\] Options: (--.*)\n', msg[0])
  slimerArgs = msgRe.group(1)

  # restore logging options:
  slimerArgs = slimerArgs.replace(', --verbose=true', '')
  slimerArgs = slimerArgs.replace(', --logLevel=info', '')
  if verbose is not None:
    slimerArgs = slimerArgs + ', ' + verbose
  if logLevel is not None:
    slimerArgs = slimerArgs + ', ' + logLevel

  # check with phantomjs engine:
  slimerArgs = slimerArgs.replace('slimerjs', 'phantomjs')

  # check:
  slimerArgs = slimerArgs.replace('--do=add', '--do=check')

  # resetting checking directory:
  slimerArgs = slimerArgs.replace('--rootDir', '--checkDir')

  allArgs = requiredArgs + slimerArgs.split(', ')

  call(allArgs)
  shutil.rmtree(slimerTmp)
else:
  call(allArgs)
