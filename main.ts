// PD計算
function PD_control () {
    error = 0 - X
    eKd = error - error_old
    error_old = error
    PD = error * Kp + eKd * Kd
    // 馬達控制
    Morto_control()
}
// 紅外線正規化
function IR_Nor () {
    for (let index2 = 0; index2 <= 4; index2++) {
        // 計算出最大最小值並鎖值
        // 計算出最大最小值並鎖值
        Nor[index2] = Math.constrain(Math.map(IR[index2], Min[index2], Max[index2], 10, 3800), 0, 4000)
    }
}
// 計算線段中心位置
function Weights () {
    if (!(Nor[0] < 1000 && (Nor[1] < 1000 && Nor[2] < 1000) && (Nor[3] < 1000 && Nor[4] < 1000))) {
        X = (Nor[0] * -2.2 + Nor[1] * -1 + Nor[2] * 0 + Nor[3] * 1 + Nor[4] * 2.2) / (Nor[0] + Nor[1] + Nor[2] + Nor[3] + Nor[4])
    }
}
// 開啟紅外線取值
input.onButtonPressed(Button.A, function () {
    basic.showLeds(`
        # # # # #
        # . . . #
        # . . . #
        # . . . #
        # # # # #
        `)
    music.playTone(262, music.beat(BeatFraction.Eighth))
    // 紅外線數值初始化
    Init_Sampling()
    OPENSampling = 1
})
// 馬達控制命令 ID 0 = 左輪 ID 1 = 右輪 DIR = 0 正轉 DIR = 1 反轉 PWM = 0 停止 PWM 255 = 全速
function Motor (ID: number, Dir: number, Pwm: number) {
    let i2cBuf = pins.createBuffer(3)
i2cBuf[0] = ID
    i2cBuf[1] = Dir
    i2cBuf[2] = Pwm
    pins.i2cWriteBuffer(0x10, i2cBuf)
}
// 紅外線最大&最小值
function Sampling () {
    for (let index6 = 0; index6 <= 4; index6++) {
        if (IR[index6] > Max[index6]) {
            Max[index6] = IR[index6]
        }
        if (IR[index6] < Min[index6]) {
            Min[index6] = IR[index6]
        }
    }
}
// 開始循線線
input.onButtonPressed(Button.AB, function () {
    basic.showLeds(`
        . . # . .
        . # # # .
        # . # . #
        . . # . .
        . . # . .
        `)
    music.playTone(262, music.beat(BeatFraction.Eighth))
    Open = 1
})
// 關閉紅外線取值
input.onButtonPressed(Button.B, function () {
    basic.showLeds(`
        # . . . #
        . # . # .
        . . # . .
        . # . # .
        # . . . #
        `)
    music.playTone(262, music.beat(BeatFraction.Eighth))
    OPENSampling = 0
})
// 馬達控制命令
function Morto_control () {
    PWM_R = Math.constrain(SPEED + PD, -255, 255)
    PWM_L = Math.constrain(SPEED - PD, -255, 255)
    if (PWM_R >= 0) {
        Motor(2, 0, PWM_R)
    } else {
        Motor(2, 1, Math.abs(PWM_R))
    }
    if (PWM_L >= 0) {
        Motor(0, 0, PWM_L)
    } else {
        Motor(0, 1, Math.abs(PWM_L))
    }
}
// 讀取紅外線數值
function ReadAdc () {
    for (let index = 0; index <= 4; index++) {
        // N76E003 的 I2C 地址為0x10 = 十進制 16 跟N76E003通訊 選擇要讀取的紅外線
        pins.i2cWriteNumber(
        16,
        index + 3,
        NumberFormat.Int8BE,
        false
        )
        // 讀取紅外線值
        // 讀取紅外線值
        IR[index] = pins.i2cReadNumber(16, NumberFormat.Int16BE, false)
    }
}
// 紅外線數值初始化
function Init_Sampling () {
    for (let index4 = 0; index4 <= 4; index4++) {
        Max[index4] = 200
        Min[index4] = 3800
    }
}
let PWM_L = 0
let PWM_R = 0
let Open = 0
let OPENSampling = 0
let PD = 0
let error_old = 0
let eKd = 0
let X = 0
let error = 0
let Kp = 0
let Kd = 0
let SPEED = 0
let Min: number[] = []
let Max: number[] = []
let Nor: number[] = []
let IR: number[] = []
pins.digitalWritePin(DigitalPin.P16, 0)
pins.digitalWritePin(DigitalPin.P8, 0)
IR = [5]
Nor = [5]
Max = [5]
Min = [5]
Init_Sampling()
SPEED = 120
Kd = 160
Kp = 65
music.playTone(262, music.beat(BeatFraction.Quarter))
pins.digitalWritePin(DigitalPin.P16, 1)
pins.digitalWritePin(DigitalPin.P8, 1)
basic.forever(function () {
    // 開始讀取紅外線
    if (OPENSampling == 1) {
        ReadAdc()
        Sampling()
    }
    // 開始循線
    if (Open == 1) {
        ReadAdc()
        IR_Nor()
        Weights()
        PD_control()
    }
})
