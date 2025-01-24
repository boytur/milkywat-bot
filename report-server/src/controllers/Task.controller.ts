import { Request, Response } from "express";
import Encrypt from "../utils/Encrypt";
import User from "../models/User.model";
import { JwtPayload } from "jsonwebtoken";
import Task from "../models/Task.model";
import { Op } from "sequelize";
import { sprint } from "../data/sprintdata";

export class TaskController {
  static async getUserTask(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        return res.status(403).json({ error: "No token provided" });
      }
      let { limit, page } = req.query;

      const acc_tk = authHeader.split(" ")[1];
      const user = (await Encrypt.getUserData(acc_tk)) as JwtPayload;
      // Validate and parse limit and page
      const parsedLimit = TaskController.validateLimit(Number(limit || 10));
      const parsedPage = TaskController.validatePage(Number(page || 1));

      const offset = (parsedPage - 1) * parsedLimit;

      if (!user) {
        return res
          .status(403)
          .json({ error: "You are not allowed to access this resource" });
      }

      const { rows: tasks, count } = await Task.findAndCountAll({
        order: [["date", "DESC"]],
        where: {
          user_id: user.user_id,
        },
        offset,
        limit: parsedLimit,
      });

      return res.status(200).json({
        success: true,
        message: " Get tasks successfully!",
        meta: {
          total: count,
          page: parsedPage,
          totalPage: Math.ceil(count / parsedLimit),
          limit: parsedLimit,
        },
        tasks,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  static async getTasks(req: Request, res: Response) {
    try {
      let { date, status, showUnchecked, limit, page } = req.query;

      // Validate and parse limit and page
      const parsedLimit = TaskController.validateLimit(Number(limit || 10));
      const parsedPage = TaskController.validatePage(Number(page || 1));

      let query: any = {};

      if (showUnchecked === "true") {
        query.is_check = false;
      } else {
        if (date) {
          if (!TaskController.isValidDate(date as string)) {
            return res.status(400).json({ error: "Invalid date format" });
          }
          query.date = {
            [Op.eq]: date,
          };
        }

        if (status === "checked") {
          query.is_check = true;
        } else if (status === "unchecked") {
          query.is_check = false;
        }
      }

      const offset = (parsedPage - 1) * parsedLimit;

      const { rows: tasks, count } = await Task.findAndCountAll({
        order: [["date", "DESC"]],
        where: query,
        include: [User],
        offset,
        limit: parsedLimit,
      });

      const totalPage = Math.ceil(count / parsedLimit);

      return res.status(200).json({
        success: true,
        message: "Get tasks successfully!",
        meta: {
          total: count,
          page: parsedPage,
          limit: parsedLimit,
          totalPage:totalPage
          
        },
        tasks,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  static async getTaskById(req: Request, res: Response) {
    try {
      const discord_id = req.params.discord_id;

      const taskRegex = /^\d+$/;
      if (!taskRegex.test(discord_id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid input",
        });
      }

      const user = await User.findOne({
        where: {
          discord_id: discord_id,
        },
        attributes: [
          "user_id",
          "discord_id",
          "user_fname",
          "user_lname",
          "avatar",
        ],
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
      const userId = user.user_id;

      const tasks = await Task.findAndCountAll({
        where: {
          user_id: userId,
        },
        order: [["createdAt", "DESC"]],
      });

      const userTasks = {
        user: user,
        tasks: tasks.rows,
      };

      return res.status(200).json({
        success: true,
        message: "Get task successfully!",
        tasks: userTasks,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  static async updateTask(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(403).json({ error: "No token provided" });
      }

      const acc_tk = authHeader.split(" ")[1];
      const user = (await Encrypt.getUserData(acc_tk)) as JwtPayload;

      if (!user) {
        return res
          .status(403)
          .json({ error: "You are not allowed to access this resource" });
      }

      const taskId = req.params.id;
      const { task_name, is_done, task_type, is_check, work_date } = req.body;

      // Validate task ID and updated data
      if (!taskId || !task_name || typeof is_done !== "boolean" || !task_type) {
        return res.status(400).json({ error: "Invalid input" });
      }

      // Find the task to update
      const task = await Task.findByPk(taskId);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      // Update the task
      await Task.update(
        {
          task_name,
          is_done,
          task_type,
          is_check,
          work_date,
        },
        {
          where: {
            task_id: taskId,
          },
        }
      );

      return res.status(200).json({
        success: true,
        message: "Task updated successfully",
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  static async getSprintTasks(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(403).json({ error: "No token provided" });
      }

      const acc_tk = authHeader.split(" ")[1];
      const user = (await Encrypt.getUserData(acc_tk)) as JwtPayload;

      if (!user) {
        return res
          .status(403)
          .json({ error: "You are not allowed to access this resource" });
      }

      // Find the current sprint
      const sprintTime = sprint.find((sprint) => {
        const today = new Date();
        return (
          new Date(sprint.sprint_start) <= today &&
          new Date(sprint.sprint_end) >= today
        );
      });

      if (!sprintTime) {
        return res.status(404).json({
          success: false,
          message: "No sprint available",
        });
      }

      // Find tasks in the current sprint
      const tasks = await Task.findAll({
        where: {
          user_id: user.user_id,
          work_date: {
            [Op.between]: [sprintTime.sprint_start, sprintTime.sprint_end],
          },
        },
      });

      // Return the sprint and tasks
      return res.status(200).json({
        success: true,
        message: "Get sprint tasks successfully!",
        sprint: sprintTime,
        tasks,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  static async getTaskBySprint(req: Request, res: Response) {
    try {
      const sprintReq = req.params.sprint as string | undefined;

      const replaceSlash = sprintReq?.replace("-", "/");

      const findSprint = sprint.find(
        (sprint) => sprint.sprint_name === replaceSlash
      );

      if (!findSprint) {
        return res.status(404).json({
          success: false,
          message: "Sprint not found",
        });
      }

      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(403).json({ error: "No token provided" });
      }

      const acc_tk = authHeader.split(" ")[1];
      const user = (await Encrypt.getUserData(acc_tk)) as JwtPayload;

      const tasks = await Task.findAll({
        where: {
          user_id: user.user_id,
          work_date: {
            [Op.between]: [findSprint.sprint_start, findSprint.sprint_end],
          },
        },
      });

      // Return the sprint and tasks
      return res.status(200).json({
        success: true,
        message: "Get sprint tasks successfully!",
        sprint: findSprint,
        tasks,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
  // Helper function to validate limit (perPage)
  static validateLimit(perPage: number): number {
    return perPage > 0 && perPage <= 100 ? perPage : 10;
  }

  // Helper function to validate page
  static validatePage(page: number): number {
    return page > 0 ? page : 1;
  }

  // Helper function to validate numbers using regex (only numeric values allowed)
  static isValidNumber(value: any): boolean {
    const regex = /^[0-9]+$/;
    return regex.test(value);
  }

  // Helper function to validate date format (YYYY-MM-DD)
  static isValidDate(dateString: string): boolean {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    return regex.test(dateString);
  }
}
