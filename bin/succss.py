#!/usr/bin/env python 
import os,sys,re,subprocess,shutil

from subprocess import call

from optparse import OptionParser
parser = OptionParser()

scriptpath = os.path.dirname(os.path.realpath(__file__)) 
casperbridge = scriptpath + '/../succss-bridge.js'
allArgs = ["casperjs", "test", casperbridge]

#1. take first sys.argv argument and prepend --do to it, add the resulting string to allArgs list
#2. take the second argument and prepend --dataFile tot it, add the resulting string to allArgs list
#3. append all the remaining options to the allArgs list
if len(sys.argv) > 1:
  do = sys.argv.pop(1)
else:
  call(allArgs)
  exit()
if len(sys.argv) > 1:
  dataFile = os.getcwd() + '/' + sys.argv.pop(1)
  allArgs.append("--dataFile=" + dataFile)

slimerjsCheck = False
for i, arg in enumerate(sys.argv):
  #clean remaining args:
  if arg.startswith('--') and arg.startswith('-'):
    allArgs.append(arg)
  #when slimerjs is run with the check command,
  #add with slimer then check with default
  if do == 'check' and re.match('--engine=(\'|")?slimerjs(\'|")?', arg):
    do='add'
    slimerjsCheck = True
    engineArgPos = allArgs.index(arg)

allArgs.append('--do=' + do)

if slimerjsCheck:
  # adding tmp updates with slimerjs
  allArgs.append('--rootDir=.slimerjs-base')
  p=subprocess.Popen(allArgs,stdin=subprocess.PIPE,stdout=subprocess.PIPE)
  print '... Taking captures updates'
  msg = p.communicate()
  print 'Done'
  # preparing to check with default engine:
  allArgs.pop(engineArgPos)
  allArgs.append('--skipUpdates=true')
  allArgs.pop(allArgs.index('--rootDir=.slimerjs-base'))
  allArgs.append('--diffDir=.slimerjs-base')
  allArgs.pop(allArgs.index('--do=add'))
  allArgs.append('--do=check')
  call(allArgs)
  shutil.rmtree('.slimerjs-base')
else:
  call(allArgs)
