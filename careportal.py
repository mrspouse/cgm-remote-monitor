import os
from bs4 import BeautifulSoup
from datetime import datetime
from datetime import timedelta

html_file = open('careportal.html', 'r', encoding='utf-8')
csv_file = 'careportal.csv'

source_code = html_file.read()
soup = BeautifulSoup(source_code, 'lxml')

for element in soup.find_all("label"):
#    for value in element["for"]]

    print(element.attrs)



    # output file 
# initialise variables
# event, date, time, t_vol, i_vol, basal_start, basal_end, basal_delta, basal_rec, e_vol, e_duration, u_corr, s_vol, s_corr, iob, target, isf, meal, ic_ratio = [''] * 19
# time_rec = False
# basal_last = False
# # initialise write
# rec = ''

# with open(csv_file, 'w') as file:
#     headings = 'date, time, event, t_vol, i_vol, e_vol, e_duration, u_corr, s_vol, s_corr, iob, target, isf, meal, ic_ratio, basal_delta'
#     file.write(headings + os.linesep)

# data []

