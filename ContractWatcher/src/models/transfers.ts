import { Entity, BaseEntity, PrimaryGeneratedColumn, Column } from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";

/**
 * Used to specify the schema of the DB.
 */
@Entity()
@ObjectType()
export class Transfer extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  Id: string;

  @Field(() => String)
  @Column()
  transactionHash: string;

  @Field(() => Number)
  @Column()
  blockNumber: number;

  @Field(() => String)
  @Column()
  contractAddress: string;

  @Field(() => String)
  @Column()
  fromAddress: string;

  @Field(() => String)
  @Column()
  toAddress: string;

  @Field(() => Number)
  @Column()
  tokenId: number;

  @Field(() => Boolean)
  @Column()
  @Column({ default: false })
  isRead: boolean;
}