import cv2 as cv
import numpy as np

source = cv.imread('icon-1024.png', cv.IMREAD_UNCHANGED)
cv.imwrite('icon-512.png', cv.resize(source, (512, 512)))
cv.imwrite('icon-300.png', cv.resize(source, (300, 300)))
cv.imwrite('icon-128.png', cv.resize(source, (128, 128)))
cv.imwrite('icon-112.png', cv.resize(source, (112, 112)))
cv.imwrite('icon-96.png', cv.resize(source, (96, 96)))
cv.imwrite('icon-56.png', cv.resize(source, (56, 56)))
cv.imwrite('icon-64.png', cv.resize(source, (64, 64)))
cv.imwrite('icon-48.png', cv.resize(source, (48, 48)))
cv.imwrite('icon-38.png', cv.resize(source, (38, 38)))
cv.imwrite('icon-32.png', cv.resize(source, (32, 32)))
cv.imwrite('icon-19.png', cv.resize(source, (19, 19)))
cv.imwrite('icon-16.png', cv.resize(source, (16, 16)))