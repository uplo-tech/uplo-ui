import * as React from 'react'
import Transition, { TransitionProps } from 'react-transition-group/Transition'
import { TimelineMax, TweenLite, TweenMax, Expo, Linear, Power1 } from 'gsap'
import './bonus/DrawSVGPlugin.min.js'

export const SiaLogo = ({ width, height }) => (
  <div>
    <div style={{ width, height }}>
      <svg id="uplo-logo" width="100%" height="100%" viewBox="-10 -10 277 277" version="1.1">
        <g id="Uplo-Logo" transform="translate(-0.109375, 0.562500)">
          <g transform="translate(0.420058, 0.407811)" strokeWidth="1px" stroke="#7F8C8D">
            <g id="spinner">
              <path
                d="M57.2433086,21.3506107 L61.9234926,27.277593 C81.2437494,14.5648555 104.41953,7.25462637 129.288124,7.53264021 C193.48118,8.24984772 246.18186,59.7949795 248.252467,123.958188 C250.495339,193.470177 193.468388,250.497128 123.956398,248.25255 C59.794043,246.181091 8.24976405,193.479558 7.53255655,129.287355 C7.25539551,104.41876 14.5656246,81.2438331 27.2766565,61.9235763 L21.350527,57.2433923 C8.12013796,77.1256464 0.296521293,100.900947 0.00827380721,126.454343 C-0.780569164,196.36715 54.9364759,254.228142 124.97294,255.807534 C197.902965,257.452591 257.45336,197.902196 255.808303,124.972171 C254.227206,54.9357068 196.366213,-0.781338303 126.454259,0.00835747148 C100.900863,0.296604957 77.1255627,8.12107443 57.2433086,21.3506107 Z"
                id="loop"
              />
              <path
                d="M52.6734757,40.1321517 C52.6734757,47.0586193 47.0586193,52.6734757 40.1321517,52.6734757 C33.205684,52.6734757 27.5908276,47.0586193 27.5908276,40.1321517 C27.5908276,33.205684 33.205684,27.5908276 40.1321517,27.5908276 C47.0586193,27.5908276 52.6734757,33.205684 52.6734757,40.1321517"
                id="dot"
              />
            </g>
            <path className="cls-1"
                  d="M-6.85,97.48C-.56,95.91,5.26,94.89,10.5,92c15.55-8.44,24.55-21,24.6-39.14,0-18.72-.08-37.44.13-56.15,0-3.89-1-5.37-4.92-4.89a74.23,74.23,0,0,1-8.18.06L51.53-56,81-8.08c-3.19,0-5.53.21-7.81,0-4-.45-5.36.82-5.29,5.07.26,15.6.17,31.2.06,46.8,0,5.71-.28,11.43-.82,17.12C64,94.3,22.39,115.35-6.85,97.48Z"
                  transform="translate(105 110)" id="center"/>
            <path className="cls-1"
                  d="M20.92,71.4C14.91,83.1.19,90.33-11.94,87.83-22.88,85.57-32.2,74.25-32.61,60.89c-.6-19.73-.33-39.5-.4-59.25,0-9.77,0-9.77,9.81-9.77,6.07,0,12.15.21,18.2-.08,3.67-.17,4.67,1,4.63,4.65C-.55,14.28-.47,32.14-.47,50-.48,64.82,5.63,71.05,20.92,71.4ZM20.92,71.4C14.91,83.1.19,90.33-11.94,87.83-22.88,85.57-32.2,74.25-32.61,60.89c-.6-19.73-.33-39.5-.4-59.25,0-9.77,0-9.77,9.81-9.77,6.07,0,12.15.21,18.2-.08,3.67-.17,4.67,1,4.63,4.65C-.55,14.28-.47,32.14-.47,50-.48,64.82,5.63,71.05,20.92,71.4Z"
                  transform="translate(105 110)" id="center"/>
          </g>
        </g>
      </svg>
    </div>
  </div>
)

export const TransitionSiaSpinner = ({
  width = 200,
  height = 200,
  ...props
}: Partial<TransitionProps> & any) => {
  return (
    <Transition
      {...props}
      appear
      mountOnEnter
      unmountOnExit
      timeout={10000}
      addEndListener={(n, done) => {
        if (props.in) {
          const t = new TimelineMax()
          const paths = n.querySelectorAll('path')
          const greenFill = n.querySelectorAll('#dot, #center')
          const greyFill = n.querySelectorAll('#loop')
          const spinner = n.querySelectorAll('#spinner')

          const drawPath = TweenMax.fromTo(
            paths,
            2,
            {
              force3D: true,
              drawSVG: '50% 50%',
              opacity: 0,
              fill: 'transparent',
              ease: Linear.easeNone
            },
            { force3D: true, drawSVG: true, opacity: 1 }
          )
          const fadeInFromBottom = TweenMax.from(n, 1, {
            force3D: true,
            transform: 'translateY(100%)',
            opacity: 0
          })
          const removePath = TweenMax.staggerTo(paths, 2, { force3D: true, strokeOpacity: 0 }, 0.1)
          const addGreen = TweenMax.to(greenFill, 1, {
            force3D: true,
            fill: '#2CA2F8'
          })
          const addBorder = TweenMax.to(greyFill, 2, {
            force3D: true,
            fill: '#7F8C8D',
            onComplete: done
          })
          const rotateCircle = TweenMax.to(spinner, 1, {
            force3D: true,
            rotation: 360,
            transformOrigin: '50% 50%',
            repeat: -1,
            ease: Linear.easeNone
          })
          t.add([drawPath, fadeInFromBottom]).add([removePath, addGreen, addBorder, rotateCircle])
        } else {
          TweenMax.to(n, 1, {
            force3D: true,
            scale: 0.98,
            opacity: 0,
            transform: 'translateY(100%)',
            ease: Expo.easeOut,
            onComplete: done
          })
        }
      }}
    >
      <SiaLogo width={width} height={height} />
    </Transition>
  )
}

export const TransitionSiaOnlySpin = ({
  width = 200,
  height = 200,
  ...props
}: Partial<TransitionProps> & any) => {
  return (
    <Transition
      {...props}
      appear
      timeout={10000}
      addEndListener={(n, done) => {
        if (props.in) {
          const t = new TimelineMax()
          const paths = n.querySelectorAll('path')
          const greenFill = n.querySelectorAll('#dot, #center')
          const greyFill = n.querySelectorAll('#loop')
          const spinner = n.querySelectorAll('#spinner')

          TweenLite.defaultEase = Expo.easeOut
          const fadeInFromBottom = TweenMax.from(n, 0.5, {
            force3D: true,
            transform: 'translateY(100%)',
            opacity: 0
          })
          const addGreen = TweenMax.to(greenFill, 0.5, { fill: '#2CA2F8' })
          const addBorder = TweenMax.to(greyFill, 0.5, { fill: '#7F8C8D', onComplete: done })
          const rotateCircle = TweenMax.to(spinner, 1, {
            force3D: true,
            rotation: 360,
            transformOrigin: '50% 50%',
            repeat: -1,
            ease: Linear.easeNone
          })
          t.add([fadeInFromBottom, addGreen, addBorder, rotateCircle])
        } else {
          TweenMax.to(n, 0.5, {
            force3D: true,
            scale: 0.98,
            opacity: 0,
            transform: 'translateY(100%)',
            ease: Expo.easeOut,
            onComplete: done
          })
        }
      }}
    >
      <SiaLogo width={width} height={height} />
    </Transition>
  )
}
