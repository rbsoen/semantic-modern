#!usr/bin/python

import sys
import requests
from bs4 import BeautifulSoup
from bs4 import Comment

def get_plaintext_size(soup):
    out = ''
    text = soup.find_all(text=True)
    blacklist = [
	'[document]',
	'noscript',
	'header',
	'html',
	'meta',
	'head', 
	'title', 
	'input',
	'script'
    ]
    for t in text:
        if t.parent.name not in blacklist:
            if not (isinstance(t, Comment)):
                out += '{} '.format(t)
    return len(out)

def get_media_count(soup):
    count = 0
    media_list = [
	'img',
	'audio',
	'video',
	'object'
    ]
    for tag in soup.findAll():
        if tag.name in media_list:
            count += 1
    return count

def get_form_count(soup):
    count = 0
    form_list = [
	'input',
	'option',
	'textarea',
	'button'
    ]
    for tag in soup.findAll():
        if tag.name in form_list:
            count += 1
    return count

def get_anchor_count(soup):
    count = 0
    for tag in soup.findAll():
        if tag.name == 'a':
            count += 1
    return count

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Please pass one file name to be checked")
    else:
        file_name = sys.argv[1]
        with open(file_name,'r') as html_file:
            markup = html_file.read()

        soup = BeautifulSoup(markup, 'html.parser')

        overhead = 2048
        plaintext_size = get_plaintext_size(soup) * 1.5
        media_size = get_media_count(soup) * 256
        form_size = get_form_count(soup) * 128
        anchor_size = get_anchor_count(soup) * 128
        
        ideal_size = overhead + plaintext_size + media_size + form_size + anchor_size
        actual_size = len(markup)
        
        print('\nYour ideal markup size is {:0.0f} bytes!'.format(ideal_size))
        print('\n--------------- Details ---------------------\n')
        print('Overhead = {:0.0f}'.format(overhead))
        print('Plaintext = {:0.0f} * 1.5 = {:0.0f}'.format(get_plaintext_size(soup),plaintext_size))
        print('Media = {:0.0f} * 256 = {:0.0f}'.format(get_media_count(soup),media_size))
        print('Forms = {:0.0f} * 128 = {:0.0f}'.format(get_form_count(soup),form_size))
        print('Anchors = {:0.0f} * 128 = {:0.0f}'.format(get_anchor_count(soup),anchor_size))
        print('\n---------------------------------------------\n')
        print('Actual markup size: {:0.0f}'.format(actual_size))
        if actual_size <= ideal_size:
            print("Looks like you're golden!")
        else:
            print("Try simplifying your HTML a bit more...")