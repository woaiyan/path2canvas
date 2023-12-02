const reg = /\s*(M|m|L|l|H|h|V|v|C|c|S|s|Q|q|T|t|A|a|Z|z)\s*/;

// 生成绘制指令集
function geneCommand(command, argsStr, len) {
    const commands = [];
    if (argsStr && len) {
        const commandArgs = argsStr.split(/\s+|\s*,\s*/).filter(e => e).map(e => Number(e));
        const num = Math.floor(commandArgs.length / len);
        for (let i = 0;i < num; i++) {
            commands.push({
                command: command,
                args: commandArgs.splice(0, len).map(e => Number(e))
            })
        }
    } else {
        commands.push({
            command: command,
            args: []
        })
    }
    return commands;
}


// 路径格式化成指令集
function translateToCommands(str) {
    let commands = [];
    let _str = str.replaceAll('-', ' -');
    let arr =  _str.split(reg).filter(e => e);

    for (let i = 0; i < arr.length; i++) {
        switch (arr[i]) {
            case 'M': {
                commands = [...commands, ...geneCommand(arr[i], arr[i + 1], 2)];
                i++;
                break;
            }
            case 'm': {
                commands = [...commands, ...geneCommand(arr[i], arr[i + 1], 2)];
                i++;
                break;
            }
            case 'L': {
                commands = [...commands, ...geneCommand(arr[i], arr[i + 1], 2)];
                i++;
                break;
            }
            case 'l': {
                commands = [...commands, ...geneCommand(arr[i], arr[i + 1], 2)];
                i++;
                break;
            }
            case 'H': {
                commands = [...commands, ...geneCommand(arr[i], arr[i + 1], 1)];
                i++;
                break;
            }
            case 'h': {
                commands = [...commands, ...geneCommand(arr[i], arr[i + 1], 1)];
                i++;
                break;
            }
            case 'V': {
                commands = [...commands, ...geneCommand(arr[i], arr[i + 1], 1)];
                i++;
                break;
            }
            case 'v': {
                commands = [...commands, ...geneCommand(arr[i], arr[i + 1], 1)];
                i++;
                break;
            }
            case 'C': {
                commands = [...commands, ...geneCommand(arr[i], arr[i + 1], 6)];
                i++;
                break;
            }
            case 'c': {
                commands = [...commands, ...geneCommand(arr[i], arr[i + 1], 6)];
                i++;
                break;
            }
            case 'S': {
                commands = [...commands, ...geneCommand(arr[i], arr[i + 1], 4)];
                i++;
                break;
            }
            case 's': {
                commands = [...commands, ...geneCommand(arr[i], arr[i + 1], 4)];
                i++;
                break;
            }
            case 'Q': {
                commands = [...commands, ...geneCommand(arr[i], arr[i + 1], 4)];
                i++;
                break;
            }
            case 'q': {
                commands = [...commands, ...geneCommand(arr[i], arr[i + 1], 4)];
                i++;
                break;
            }
            case 'T': {
                commands = [...commands, ...geneCommand(arr[i], arr[i + 1], 2)];
                i++;
                break;
            }
            case 't': {
                commands = [...commands, ...geneCommand(arr[i], arr[i + 1], 2)];
                i++;
                break;
            }
            case 'A': {
                commands = [...commands, ...geneCommand(arr[i], arr[i + 1], 7)];
                i++;
                break;
            }
            case 'a': {
                commands = [...commands, ...geneCommand(arr[i], arr[i + 1], 7)];
                i++;
                break;
            }
            case 'Z': {
                commands = [...commands, ...geneCommand(arr[i], '', 0)];
                break;
            }
            case 'z': {
                commands = [...commands, ...geneCommand(arr[i], '', 0)];
                break;
            }
        }
    }
    return commands;
}

//获取S，s，T，t指令的第一个控制点
function getSTCommandController(previousCommand, previousTruthArgs, previousPosition, currentPosition) {

    let lastCommandController = null;
    let controller = null;

    switch (previousCommand) {
        case 'C':
        case 'c':
        case 'S':
        case 's': {
            lastCommandController = [previousTruthArgs[2], previousTruthArgs[3]];
            const dx = currentPosition[0] - lastCommandController[0];
            const dy = currentPosition[1] - lastCommandController[1];
            controller = [currentPosition[0] + dx, currentPosition[1] + dy];
            break;
        }
        case 'Q':
        case 'q':
        case 'T':
        case 't': {
            lastCommandController = [previousTruthArgs[0], previousTruthArgs[1]];
            const dx = currentPosition[0] - lastCommandController[0];
            const dy = currentPosition[1] - lastCommandController[1];
            controller = [currentPosition[0] + dx, currentPosition[1] + dy];
            break;
        }
        default: {
            controller = currentPosition;
        }
    }
    return controller;
}

function drawCanvas(ctx, path) {
    // 路径字符串转换成指令集
    const commands = translateToCommands(path);
    // 第一个点的位置
    let startPosition = null;
    // 当前位置
    let currentPosition = [0, 0];
    // 上一个位置
    let previousPosition = [0, 0];
    // 上一个指令
    let previouseCommand = null;
    // 上一个指令实际执行的参数，用于Ss,Tt指令的控制点计算
    let previousTruthArgs = null;


    for (let i = 0; i < commands.length; i++) {

        let command = commands[i].command;
        let args = commands[i].args;

        // 记录上一个位置
        previousPosition = currentPosition;
        // 记录上一个指令
        previouseCommand = commands[i].command;

        switch (command) {
            case 'M': {
                ctx.moveTo(...args);
                currentPosition = [...args];
                previousTruthArgs = [...args];
                if (!startPosition) {
                    startPosition = [...args]
                }
                break;
            }
            case 'm': {
                const nextPosition = [currentPosition[0] + args[0], currentPosition[1] + args[1]];
                ctx.moveTo(...nextPosition);
                currentPosition = nextPosition;
                previousTruthArgs = [...nextPosition];
                if (!startPosition) {
                    startPosition = [...nextPosition]
                }
                break;
            }
            case 'L': {
                ctx.lineTo(...args);
                currentPosition = [...args];
                previousTruthArgs = [...args];
                break
            }
            case 'l': {
                const nextPosition = [currentPosition[0] + args[0], currentPosition[1] + args[1]];
                ctx.lineTo(...nextPosition);
                currentPosition = nextPosition;
                previousTruthArgs = [...nextPosition];
                break
            }
            case 'H': {
                const nextPosition = [args[0], currentPosition[1]];
                ctx.lineTo(...nextPosition);
                currentPosition = nextPosition;
                previousTruthArgs = [...nextPosition];
                break;
            }
            case 'h': {
                const nextPosition = [currentPosition[0] + args[0], currentPosition[1]];
                ctx.lineTo(...nextPosition);
                currentPosition = nextPosition;
                previousTruthArgs = [...nextPosition];
                break;
            }
            case 'V': {
                const nextPosition = [currentPosition[0], args[0]];
                ctx.lineTo(...nextPosition);
                currentPosition = nextPosition;
                previousTruthArgs = [...nextPosition];
                break;
            }
            case 'v': {
                const nextPosition = [currentPosition[0], currentPosition[1] + args[0]];
                ctx.lineTo(...nextPosition);
                currentPosition = nextPosition;
                previousTruthArgs = [...nextPosition];
                break;
            }
            case 'C': {
                ctx.bezierCurveTo(...args);
                currentPosition = [args[4], args[5]];
                previousTruthArgs = [...args];
                break;
            }
            case 'c': {
                const truthArgs = [currentPosition[0] + args[0], currentPosition[1] + args[1], currentPosition[0] + args[2], currentPosition[1] + args[3], currentPosition[0] + args[4], currentPosition[1] + args[5]]
                ctx.bezierCurveTo(...truthArgs);
                currentPosition = [truthArgs[4], truthArgs[5]];
                previousTruthArgs = [...truthArgs];
                break;
            }
            case 'S': {
                const c1 = getSTCommandController(previouseCommand, previousTruthArgs, previousPosition, currentPosition);
                const truthArgs = [...c1, args[0], args[1], args[2], args[3]]
                ctx.bezierCurveTo(...truthArgs);
                currentPosition = [truthArgs[4], truthArgs[5]];
                previousTruthArgs = [...truthArgs];
                break;
            }
            case 's': {
                const c1 = getSTCommandController(previouseCommand, previousTruthArgs, previousPosition, currentPosition);
                const truthArgs = [...c1, currentPosition[0] + args[0], currentPosition[1] + args[1], currentPosition[0] + args[2], currentPosition[1] + args[3]]
                ctx.bezierCurveTo(...truthArgs);
                currentPosition = [truthArgs[4], truthArgs[5]];
                previousTruthArgs = [...truthArgs];
                break;
            }
            case 'Q': {
                ctx.quadraticCurveTo(...args);
                currentPosition = [args[2], args[3]];
                previousTruthArgs = [...args];
                break;
            }
            case 'q': {
                const truthArgs = [currentPosition[0] + args[0], currentPosition[1] + args[1], currentPosition[0] + args[2], currentPosition[1] + args[3]]
                ctx.quadraticCurveTo(...truthArgs);
                currentPosition = [truthArgs[2], truthArgs[3]];
                previousTruthArgs = [...truthArgs];
                break;
            }
            case 'T': {
                const c1 = getSTCommandController(previouseCommand, previousTruthArgs, previousPosition, currentPosition);
                ctx.quadraticCurveTo(...c1, args[0], args[1]);
                currentPosition = [args[0], args[1]];
                previousTruthArgs = [...args];
                break;
            }
            case 't': {
                const c1 = getSTCommandController(previouseCommand, previousTruthArgs, previousPosition, currentPosition);
                const truthArgs = [...c1, currentPosition[0] + args[0], currentPosition[1] + args[1]]
                ctx.bezierCurveTo(...truthArgs);
                currentPosition = [truthArgs[2], truthArgs[3]];
                previousTruthArgs = [...truthArgs];
                break;
            }
            case 'A': {
                const truthArgs = arcTransform(currentPosition[0], currentPosition[1], args[5], args[6], args[3], args[4], args[0],  args[1], args[2] / 180 * Math.PI);
                ctx.ellipse(...truthArgs);
                currentPosition = [args[5], args[6]];
                previousTruthArgs = [...truthArgs];
                break;
            }
            case 'a': {
                const truthArgs = arcTransform(currentPosition[0], currentPosition[1], currentPosition[0] + args[5], currentPosition[1] + args[6], args[3], args[4], args[0],  args[1], args[2] / 180 * Math.PI);
                ctx.ellipse(...truthArgs);
                currentPosition = [currentPosition[0] + args[5], currentPosition[1] + args[6]];
                previousTruthArgs = [...truthArgs];
                break;
            }
            case 'Z':
            case 'z': {
                if (currentPosition !== startPosition) {
                    ctx.lineTo(...startPosition);
                    currentPosition = [...startPosition];
                    previousTruthArgs = [...startPosition];
                    startPosition = null;
                }
                break;
            }
        }
    }
}

/**
 * svg的A和a命令的端点化参数转换到中心化参数
 * 参考 https://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes
 * @param x1
 * @param y1
 * @param x2
 * @param y2
 * @param fa
 * @param fs
 * @param rx
 * @param ry
 * @param angle
 */
function arcTransform(x1, y1, x2, y2, fa, fs, rx, ry, angle) {

    const x11 =  (x1 - x2) / 2 * Math.cos(angle) + (y1 - y2) / 2 * Math.sin(angle);
    const y11 =  (y1 - y2) / 2 * Math.cos(angle) - (x1 - x2) / 2 * Math.sin(angle) ;

    const rs = Math.pow(x11, 2) / Math.pow(rx, 2) + Math.pow(y11, 2) / Math.pow(ry, 2)
    if (rs > 1) {
        rx = rx * Math.sqrt(rs);
        ry = ry * Math.sqrt(rs);
    }
    const c_symbol = fa !== fs ? 1 : -1;

    const a =  Math.pow(rx, 2) * Math.pow(ry, 2) - Math.pow(rx, 2) * Math.pow(y11, 2)  - Math.pow(ry, 2) * Math.pow(x11, 2);
    const b = Math.pow(rx, 2) * Math.pow(y11, 2)  + Math.pow(ry, 2) * Math.pow(x11, 2);
    const cx1 = c_symbol * (rx * y11 / ry) * Math.sqrt(Math.abs(a / b))
    const cy1 = c_symbol * (-ry * x11 / rx) * Math.sqrt(Math.abs(a / b))

    // 椭圆圆心
    const cx = cx1 * Math.cos(angle)  - cy1 * Math.sin(angle) + (x1 + x2) / 2;
    const cy = cx1 * Math.sin(angle) + cy1 * Math.cos(angle) + (y1 + y2) / 2;

    let ux = 1;
    let uy = 0;
    let vx = (x11 - cx1) / rx;
    let vy = (y11 - cy1) / ry;

    // 开始角度
    let startAngle = Math.acos((ux * vx + uy * vy) / (Math.sqrt(Math.pow(ux, 2) + Math.pow(uy, 2)) * Math.sqrt(Math.pow(vx, 2) + Math.pow(vy, 2))));
    if (ux * vy - uy * vx < 0) {
        startAngle = -startAngle;
    }

    ux = (x11 - cx1) / rx;
    uy = (y11 - cy1) / ry;
    vx = (-x11 - cx1) / rx;
    vy = (-y11 - cy1) / ry;

    // 摆动角
    let swAngle = Math.acos((ux * vx + uy * vy) / (Math.sqrt(Math.pow(ux, 2) + Math.pow(uy, 2)) * Math.sqrt(Math.pow(vx, 2) + Math.pow(vy, 2))));

    if (ux * vy - uy * vx < 0) {
        swAngle = -swAngle;
    }
    return [cx, cy, rx, ry, angle, startAngle,  startAngle + swAngle, !fs]
}

