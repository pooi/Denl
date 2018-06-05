
import json
import sys
import argparse

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--id", help="login ID")
    parser.add_argument("--pw", help="login password")
    parser.add_argument("--only", help="just login")
    args = parser.parse_args()

    id = pw = ""
    isOnlyLogin = False
    if args.id:
        id = args.id
    if args.pw:
        pw = args.pw
    if args.only:
        try:
            tmp = int(args.only)
            isOnlyLogin = (tmp == 1)
        except:
            isOnlyLogin = False

    if id == "" or pw == "":
        data = {}
        data['status'] = 'fail'
        data['err'] = 'Invalid argument.'
        print(json.dumps(data, ensure_ascii=False))
        exit()

    if id == "12345678" and pw == "123456":
        data = {}
        data['name'] = "홍길동"
        data['type'] = "학부생"
        data['studentID'] = "12345678"
        data['major'] = "전자정보공학대학/디지털콘텐츠학과"
        data['contact'] = "01011111111"
        data['email'] = "admin@denl.xyz"
        data['status'] = 'success'
        print(json.dumps(data, ensure_ascii=False))
        exit()

    from selenium import webdriver
    from selenium.webdriver.common.desired_capabilities import DesiredCapabilities

    url = 'https://portal.sejong.ac.kr/jsp/login/loginSSL.jsp'

    dcap = dict(DesiredCapabilities.PHANTOMJS)
    dcap["phantomjs.page.settings.userAgent"] = (
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/53 "
        "(KHTML, like Gecko) Chrome/15.0.87"
    )
    driver = webdriver.PhantomJS(desired_capabilities=dcap)
    driver.get(url)

    try:

        driver.find_element_by_id('id').send_keys(id)
        driver.find_element_by_id('password').send_keys(pw)

        loginForm = driver.find_element_by_name('loginForm')
        loginForm.submit()

        txt = driver.find_element_by_class_name('txt')

        if isOnlyLogin:
            data = {}
            data['status'] = 'success'
            data['studentID'] = id
            print(json.dumps(data, ensure_ascii=False))

        else:
            driver.get('http://library.sejong.ac.kr/sso/Login.ax')
            driver.get('http://library.sejong.ac.kr/studyroom/Request.ax?roomId=11')

            table = driver.find_element_by_xpath("//table[@class='tb03 width-full']")
            table = table.find_elements_by_tag_name('tr')
            table = table[:3]

            dataList = []
            for tr in table:
                tds = tr.find_elements_by_xpath(".//*")
                for i in range(len(tds)):
                    if i % 2 == 1:
                        td = tds[i]
                        dataList.append(td.text.strip())

            data = {}
            for i in range(len(dataList)):
                temp = dataList[i]
                if i == 0:
                    data['name'] = temp
                    pass
                elif i == 1:
                    data['type'] = temp
                    pass
                elif i == 2:
                    data['studentID'] = temp
                    pass
                elif i == 3:
                    data['major'] = temp
                    pass
                elif i == 4:
                    tempList = temp.split()
                    list = []
                    for tmp in tempList:
                        if tmp != "":
                            list.append(tmp)
                    data['contact'] = ','.join(list)
                    pass
                elif i == 5:
                    data['email'] = temp
                    pass
            data['status'] = 'success'
            print(json.dumps(data, ensure_ascii=False))

        # driver.implicitly_wait(3)

        # html = driver.page_source
        # print(html)


    except Exception as e:
        # print(e)
        data = {}
        data['status'] = 'fail'
        data['err'] = 'Invalid id or password.'
        print(json.dumps(data, ensure_ascii=False))
    finally:
        driver.close()



# if len(sys.argv) > 2:
#     id = sys.argv[1]
#     pw = sys.argv[2]
# else:
#     data = {}
#     data['status'] = 'fail'
#     data['err'] = 'Invalid argument.'
#     print(json.dumps(data, ensure_ascii=False))
#     exit()
#
# url = 'https://portal.sejong.ac.kr/jsp/login/loginSSL.jsp'
#
# dcap = dict(DesiredCapabilities.PHANTOMJS)
# dcap["phantomjs.page.settings.userAgent"] = (
#     "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/53 "
#     "(KHTML, like Gecko) Chrome/15.0.87"
# )
# driver = webdriver.PhantomJS(desired_capabilities=dcap)
# driver.get(url)
#
# try:
#
#     driver.find_element_by_id('id').send_keys(id)
#     driver.find_element_by_id('password').send_keys(pw)
#
#     loginForm = driver.find_element_by_name('loginForm')
#     loginForm.submit()
#
#
#     txt = driver.find_element_by_class_name('txt')
#
#     driver.get('http://library.sejong.ac.kr/sso/Login.ax')
#     driver.get('http://library.sejong.ac.kr/studyroom/Request.ax?roomId=11')
#
#     table = driver.find_element_by_xpath("//table[@class='tb03 width-full']")
#     table = table.find_elements_by_tag_name('tr')
#     table = table[:3]
#
#     dataList = []
#     for tr in table:
#         tds = tr.find_elements_by_xpath(".//*")
#         for i in range(len(tds)):
#             if i%2 == 1:
#                 td = tds[i]
#                 dataList.append(td.text.strip())
#
#     data = {}
#     for i in range(len(dataList)):
#         temp = dataList[i]
#         if i == 0:
#             data['name'] = temp
#             pass
#         elif i== 1:
#             data['identity'] = temp
#             pass
#         elif i== 2:
#             data['studentId'] = temp
#             pass
#         elif i== 3:
#             data['major'] = temp
#             pass
#         elif i== 4:
#             data['phone'] = temp
#             pass
#         elif i== 5:
#             data['email'] = temp
#             pass
#     data['status'] = 'success'
#     print(json.dumps(data, ensure_ascii=False))
#
#     # driver.implicitly_wait(3)
#
#     # html = driver.page_source
#     # print(html)
#
#
# except Exception as e:
#     # print(e)
#     data = {}
#     data['status'] = 'fail'
#     data['err'] = 'Invalid id or password.'
#     print(json.dumps(data, ensure_ascii=False))
# finally:
#     driver.close()
