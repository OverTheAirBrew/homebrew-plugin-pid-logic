import {
  Logic,
  LogicToken,
  NumberProperty,
} from '@overtheairbrew/homebrew-plugin';
import { Service } from 'typedi';

interface IPidLogicParams {
  p: number;
  i: number;
  d: number;
  max: number;

  targetTemp: number;
  e: number;
  currentTemp: number;
}

@Service({ id: LogicToken, multiple: true })
export class PidLogic extends Logic {
  constructor() {
    super('pid', [
      new NumberProperty('p', true),
      new NumberProperty('i', true),
      new NumberProperty('i', true),
      new NumberProperty('max', false),
    ]);
  }

  private _maxP = 1000; // Limit the maximum value of the abs Proportional (because micro controller registers)
  private _maxI = 1000; // Limit the maximum value of the abs Integral (because micro controller registers)
  private _maxD = 1000; // Limit the maximum value of the abs Derivative (because micro controller registers)
  private _maxU = 1000;
  private sample_time = 5;

  public async run(params: IPidLogicParams) {
    const { waitTime, heatTime, prev } = await this.calculate(params);

    return {
      waitTime,
      heatTime,
      opts: {
        prev,
      },
    };
  }

  private async calculate(params: IPidLogicParams) {
    const kp = params.p;
    const ki = params.i;
    const kd = params.d;
    const max = params.max || 4000;

    const ePrev = params.e || 0;
    const e = params.targetTemp - params.currentTemp;

    let p = kp * e;
    if (p > this._maxP) {
      p = this._maxP;
    } else if (p < -1 * this._maxP) {
      p = -1 * this._maxP;
    }

    let i = ki * e;
    if (i > this._maxI) {
      i = this._maxI;
    } else if (i < -1 * this._maxI) {
      i = -1 * this._maxI;
    }

    let d = kd * (e - ePrev);
    if (d > this._maxD) {
      d = this._maxD;
    } else if (d < -1 * this._maxD) {
      d = -1 * this._maxD;
    }

    let u = p + i + d;
    if (u > this._maxU) {
      u = this._maxU;
    } else if (u < 0) {
      u = 0;
    }

    const heatTime = (u / 1000) * max;
    const waitTime = this.sample_time - heatTime;

    return {
      heatTime,
      waitTime,
      prev: e,
    };
  }
}
